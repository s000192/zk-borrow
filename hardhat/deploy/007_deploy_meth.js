const WETH = new Map();
WETH.set("4", "0xc778417e063141139fce010982780140aa0cd5ab");
WETH.set("31337", "0xc778417e063141139fce010982780140aa0cd5ab");
WETH.set("1313161554", "");

const ETH_PRICE_FEED = new Map();
ETH_PRICE_FEED.set("4", "0x8A753747A1Fa494EC906cE90E9f37563A8AF630e");
ETH_PRICE_FEED.set("31337", "0x8A753747A1Fa494EC906cE90E9f37563A8AF630e");
ETH_PRICE_FEED.set("1313161554", "");

module.exports = async function ({
  getChainId,
  getNamedAccounts,
  deployments,
}) {
  const { deploy } = deployments;

  const { deployer } = await getNamedAccounts();
  const chainId = await getChainId();
  const Joetroller = await ethers.getContract("Joetroller");
  const unitroller = await ethers.getContract("Unitroller");
  const joetroller = Joetroller.attach(unitroller.address);

  const interestRateModel = await ethers.getContract("MajorInterestRateModel");

  await deploy("JAvaxDelegate", {
    from: deployer,
    log: true,
    deterministicDeployment: false,
    contract: "JWrappedNativeDelegate",
  });

  const jAvaxDelegate = await ethers.getContract("JAvaxDelegate");
  const hasher = await ethers.getContract("Hasher");
  const verifier = await ethers.getContract("Verifier");

  const deployment = await deploy("JAvaxDelegator", {
    from: deployer,
    args: [
      WETH.get(chainId),
      joetroller.address,
      interestRateModel.address,
      ethers.utils.parseUnits("2", 26).toString(),
      ethers.utils.parseEther("1").toString(), // default deposit
      "Methane ETH",
      "mETH",
      8,
      deployer,
      jAvaxDelegate.address,
      "0x",
      20,
      hasher.address,
      verifier.address
    ],
    log: true,
    deterministicDeployment: false,
    contract: "JWrappedNativeDelegator",
  });
  await deployment.receipt;
  const jAvaxDelegator = await ethers.getContract("JAvaxDelegator");

  console.log("Supporting mETH market...");
  await joetroller._supportMarket(jAvaxDelegator.address, 2, {
    gasLimit: 2000000,
  });

  const priceOracle = await ethers.getContract("PriceOracleProxyUSD");
  console.log("Setting price feed source for mETH");
  await priceOracle._setAggregators(
    [jAvaxDelegator.address],
    [ETH_PRICE_FEED.get(chainId)]
  );

  const collateralFactor = "0.75";
  console.log("Setting collateral factor ", collateralFactor);
  await joetroller._setCollateralFactor(
    jAvaxDelegator.address,
    ethers.utils.parseEther(collateralFactor)
  );

  const reserveFactor = "0.20";
  console.log("Setting reserve factor ", reserveFactor);
  await jAvaxDelegator._setReserveFactor(
    ethers.utils.parseEther(reserveFactor)
  );
};

module.exports.tags = ["mETH"];
module.exports.dependencies = [
  "Joetroller",
  "TripleSlopeRateModel",
  "PriceOracle",
];
