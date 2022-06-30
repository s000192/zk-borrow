module.exports = async ({ getNamedAccounts, deployments }) => {
  const { deploy } = deployments;
  const { deployer } = await getNamedAccounts();
  const hasher = await ethers.getContract("Hasher");
  const Joetroller = await ethers.getContract("Joetroller");
  const unitroller = await ethers.getContract("Unitroller");
  const joetroller = Joetroller.attach(unitroller.address);

  await deploy('MerkleTreeWithHistory', {
    from: deployer,
    args: [
      deployer,
      20,
      hasher.address,
      joetroller.address,
    ],
    log: true,
    deterministicDeployment: false
  });
};
module.exports.tags = ['MerkleTreeWithHistory'];
