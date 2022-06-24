module.exports = async function ({ getNamedAccounts, deployments }) {
  const { deploy } = deployments;

  const { deployer } = await getNamedAccounts();

  await deploy("JoeLens", {
    from: deployer,
    args: ["mETH"],
    log: true,
    deterministicDeployment: false,
  });
};

module.exports.tags = ["JoeLens"];
