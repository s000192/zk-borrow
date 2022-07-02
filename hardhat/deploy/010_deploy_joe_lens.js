module.exports = async function ({ getNamedAccounts, deployments }) {
  const { deploy } = deployments;

  const { deployer } = await getNamedAccounts();

  await deploy("JoeLens", {
    from: deployer,
    args: ["zkjETH"],
    log: true,
    deterministicDeployment: false,
  });
};

module.exports.tags = ["JoeLens"];
