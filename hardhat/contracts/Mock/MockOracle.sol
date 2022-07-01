pragma solidity ^0.5.16;
import "../JToken.sol";
import "../JErc20.sol";
import "../EIP20Interface.sol";
import "../Exponential.sol";

contract MockOracle is Exponential {
    mapping(address => uint256) internal prices;
    address public admin;

    constructor(address admin_) public {
        admin = admin_;
    }

    function getUnderlyingPrice(JToken jToken) public view returns (uint256) {
        address jTokenAddress = address(jToken);
        address asset = address(JErc20(jTokenAddress).underlying());
        uint256 price = mul_(prices[asset], 10**10);
        require(price > 0, "invalid price");

        uint256 underlyingDecimals = EIP20Interface(
            JErc20(jTokenAddress).underlying()
        ).decimals();

        if (underlyingDecimals <= 18) {
            return mul_(price, 10**(18 - underlyingDecimals));
        }
        return div_(price, 10**(underlyingDecimals - 18));
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
