module.exports = async function ({
  getChainId,
  getNamedAccounts,
  deployments
}) {
  const { deploy } = deployments;

  const { deployer } = await getNamedAccounts();
  const chainId = await getChainId();

  if (chainId === '1337' || chainId === '1666900000') {
    await deploy("MockOracle", {
      from: deployer,
      args: [deployer],
      log: true,
      deterministicDeployment: false,
    });
  } else {
    await deploy("PriceOracleProxyUSD", {
      from: deployer,
      args: [deployer],
      log: true,
      deterministicDeployment: false,
    });
  }
};

module.exports.tags = ["PriceOracle"];