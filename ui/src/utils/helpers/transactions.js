// require('dotenv').config()
const assert = require('assert')
const crypto = require('crypto')
const circomlib = require('circomlib')
const merkleTree = require('fixed-merkle-tree')
const leBuff2int = require("ffjavascript").utils.leBuff2int;

/** Generate random number of specified byte length */
export const rbigint = nbytes => leBuff2int(crypto.randomBytes(nbytes))

/** Compute pedersen hash */
const pedersenHash = data => circomlib.babyJub.unpackPoint(circomlib.pedersenHash.hash(data))[0]

/** BigNumber to hex string of specified length */
export function toHex(number, length = 32) {
  const str = number instanceof Buffer ? number.toString('hex') : BigInt(number).toString(16)
  return '0x' + str.padStart(length * 2, '0')
}

/**
 * Create deposit object from secret and nullifier
 */
export function createDeposit({ nullifier, secret }) {
  const preimage = Buffer.concat([nullifier.leInt2Buff(31), secret.leInt2Buff(31)])
  const commitment = pedersenHash(preimage)
  const commitmentHex = toHex(commitment)
  const nullifierHash = pedersenHash(nullifier.leInt2Buff(31))
  const nullifierHex = toHex(nullifierHash)
  return { nullifier, secret, preimage, commitment, commitmentHex, nullifierHash, nullifierHex }
}

export async function getDepositEvents(contract) {
  const eventFilter = contract.filters.Deposit();
  const events = await contract.queryFilter(eventFilter);
  return events;
}

export async function generateMerkleProof(events, deposit) {
  const leaves = events
    .sort((a, b) => a.args.leafIndex - b.args.leafIndex) // Sort events in chronological order
    .map(e => e.args.commitment)
  const tree = new merkleTree(20, leaves)

  const depositEvent = events.find(e => e.args.commitment === toHex(deposit.commitment))
  const leafIndex = depositEvent ? depositEvent.args.leafIndex : -1

  // Compute merkle proof of our commitment
  const { pathElements, pathIndices } = tree.path(leafIndex)
  return { pathElements, pathIndices, root: tree.root() }
}

export function parseNote(noteString) {
  const noteRegex = /zkjoe-(?<currency>\w+)-(?<amount>[\d.]+)-(?<netId>\d+)-0x(?<note>[0-9a-fA-F]{124})/g
  const match = noteRegex.exec(noteString)
  if (!match) {
    throw new Error('The note has invalid format')
  }

  const buf = Buffer.from(match.groups.note, 'hex')
  const nullifier = leBuff2int(buf.slice(0, 31))
  const secret = leBuff2int(buf.slice(31, 62))
  const deposit = createDeposit({ nullifier, secret })
  const netId = Number(match.groups.netId)

  return { currency: match.groups.currency, amount: match.groups.amount, netId, deposit }
}
