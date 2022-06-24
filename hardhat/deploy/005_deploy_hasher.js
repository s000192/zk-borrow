// const HasherArtifact = require("../additional-artifacts/Hasher.json");

// module.exports = async function ({ }) {
//   const [deployer] = await ethers.getSigners();

//   const HasherFactory = new ethers.ContractFactory(
//     HasherArtifact.abi,
//     HasherArtifact.bytecode,
//     deployer
//   );
//   const HasherContract = await HasherFactory.deploy();
//   await HasherContract.deployed();
//   console.log(`deployed Hasher at ${HasherContract.address}`);
// };

// module.exports.tags = ["Hasher"];

module.exports = async function ({ getNamedAccounts, deployments }) {
  const { deploy } = deployments;

  const { deployer } = await getNamedAccounts();

  await deploy("Hasher", {
    from: deployer,
    log: true,
    deterministicDeployment: false,
  });
};

module.exports.tags = ["Hasher"];