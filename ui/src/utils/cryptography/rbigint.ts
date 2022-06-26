import snarkjs from "snarkjs";
const rbigint = nbytes => {
  return snarkjs.bigInt.leBuff2int(crypto.randomBytes(nbytes));
};

export default rbigint