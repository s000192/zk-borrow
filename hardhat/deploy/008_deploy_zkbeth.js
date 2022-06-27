const { BigNumber } = require("ethers");
const { ethers } = require('hardhat');

const WETH = new Map();
WETH.set("4", "0xc778417e063141139fce010982780140aa0cd5ab");
WETH.set("1337", "0xc778417e063141139fce010982780140aa0cd5ab");
WETH.set("1666700000", "0x268d6fF391B41B36A13B1693BD25f87FB4E4b392"); // https://testnet.bridge.hmny.io/tokens

const ETH_PRICE_FEED = new Map();
ETH_PRICE_FEED.set("4", "0x8A753747A1Fa494EC906cE90E9f37563A8AF630e");
ETH_PRICE_FEED.set("1337", "0x8A753747A1Fa494EC906cE90E9f37563A8AF630e");
ETH_PRICE_FEED.set("1666700000", "0x4f11696cE92D78165E1F8A9a4192444087a45b64"); // https://docs.chain.link/docs/harmony-price-feeds/

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
  const merkleTreeWithHistory = await ethers.getContract("MerkleTreeWithHistory");

  let wethAddress = WETH.get(chainId);

  // TODO: Adding this temporarily for testing.
  if (chainId === '1337' || chainId === '1666900000') {
    const wethDeployment = await deploy("WETH", {
      from: deployer,
      args: [
        "Wrapped ETH",
        "WETH",
        18
      ],
      log: true,
      deterministicDeployment: false,
      contract: "ERC20",
    });
    wethAddress = wethDeployment.address;

    const weth = await ethers.getContract("WETH");
    await weth.mint(deployer, ethers.utils.parseUnits("100", 18));
  }

  const deployment = await deploy("JAvaxDelegator", {
    from: deployer,
    args: [
      wethAddress,
      joetroller.address,
      interestRateModel.address,
      ethers.utils.parseUnits("2", 26).toString(),
      ethers.utils.parseEther("1").toString(), // default deposit
      "ZkBorrow ETH",
      "zkbETH",
      8,
      deployer,
      jAvaxDelegate.address,
      "0x",
      hasher.address,
      verifier.address,
      merkleTreeWithHistory.address
    ],
    log: true,
    deterministicDeployment: false,
    contract: "JWrappedNativeDelegator",
  });
  await deployment.receipt;
  const jAvaxDelegator = await ethers.getContract("JAvaxDelegator");

  console.log("Initializing merkle tree for zkbETH...");
  await merkleTreeWithHistory.initializeTree(jAvaxDelegator.address);

  console.log("Supporting zkbETH market...");
  await joetroller._supportMarket(jAvaxDelegator.address, 2, {
    gasLimit: 2000000,
  });

  // TODO: Adding this temporarily for testing.
  if (chainId === '1337' || chainId === '1666900000') {
    const priceOracle = await ethers.getContract("MockOracle");
    console.log("Setting price feed source for zkbETH");
    await priceOracle._setUnderlyingPrice(
      jAvaxDelegator.address,
      BigNumber.from("123432000000")
    );
  } else {
    const priceOracle = await ethers.getContract("PriceOracleProxyUSD");
    console.log("Setting price feed source for zkbETH");
    await priceOracle._setAggregators(
      [jAvaxDelegator.address],
      [ETH_PRICE_FEED.get(chainId)]
    );
  }

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

module.exports.tags = ["zkbETH"];
module.exports.dependencies = [
  "Joetroller",
  "TripleSlopeRateModel",
  "PriceOracle",
];
