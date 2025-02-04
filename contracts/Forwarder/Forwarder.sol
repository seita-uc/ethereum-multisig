pragma solidity ^0.5.6;
import "./IERC20.sol";

contract Forwarder {
    address payable public parentAddress;
    event ForwarderDeposited(address from, uint256 value, bytes data);
    event TokenFlushed(address token, uint256 balance);

    constructor() public {
        parentAddress = msg.sender;
    }

    modifier onlyParent {
        require(msg.sender == parentAddress, "Only parent can execute this function.");
        _;
    }

    function() external payable {
        parentAddress.transfer(msg.value);
        emit ForwarderDeposited(msg.sender, msg.value, msg.data);
    }

    function flushTokens(address tokenContractAddress) public onlyParent {
        IERC20 instance = IERC20(tokenContractAddress);
        address forwarderAddress = address(this);
        uint256 forwarderBalance = instance.balanceOf(forwarderAddress);
        require(forwarderBalance != 0, "Token balance is zero.");
        require(instance.transfer(parentAddress, forwarderBalance), "Token transfer failed.");
        emit TokenFlushed(tokenContractAddress, forwarderBalance);
    }

    //It is possible that funds were sent to this address before the contract was deployed.
    //We can flush those funds to the parent address.
    function flush() public {
        // throws on failure
        parentAddress.transfer(address(this).balance);
    }
}
