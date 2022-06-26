const pedersenHash = data => {
  return circomlib.babyJub.unpackPoint(circomlib.pedersenHash.hash(data))[0]
}

export default pedersenHash