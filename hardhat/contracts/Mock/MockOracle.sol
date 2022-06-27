pragma solidity ^0.5.16;
import "../JToken.sol";
import "../JErc20.sol";

contract MockOracle {
    mapping(address => uint256) internal prices;
    address public admin;

    constructor(address admin_) public {
        admin = admin_;
    }

    function getUnderlyingPrice(JToken jToken) public view returns (uint256) {
        address jTokenAddress = address(jToken);
        address asset = address(JErc20(jTokenAddress).underlying());

        uint256 price = prices[asset];
        require(price > 0, "invalid price");
        return price;
    }

    function _setUnderlyingPrice(JToken jToken, uint256 underlyingPriceMantissa)
        external
    {
        require(
            msg.sender == admin,
            "only the admin may set the underlying price"
        );
        address asset = address(JErc20(address(jToken)).underlying());
        prices[asset] = underlyingPriceMantissa;
    }

    function setDirectPrice(address asset, uint256 price) external {
        require(msg.sender == admin, "only the admin may set the direct price");
        prices[asset] = price;
    }
}
