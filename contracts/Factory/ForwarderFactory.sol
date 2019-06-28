pragma solidity ^0.5.6;

import "../Forwarder/InitializableForwarder.sol";
import "../Ownership/HasNoEther.sol";

contract ForwarderFactory is HasNoEther {

    // An event sent when a forwarder is created.
    event ForwarderCreated(address forwarder);

    //event DebugBytes32(bytes32 log);
    //event DebugBytes20(bytes20 log);
    //event DebugAddress(address log);

    bytes32 private contractCodeHash;

    constructor() public {
        contractCodeHash = keccak256(
            type(InitializableForwarder).creationCode
        );
    }

    function createForwarder(uint256 _salt, address _parent) public returns (address) {
        return _createForwarder(_salt, msg.sender, _parent);
    }

    function getDeploymentAddress(uint256 _salt, address _sender) public returns (address) {
        // Adapted from https://github.com/archanova/solidity/blob/08f8f6bedc6e71c24758d20219b7d0749d75919d/contracts/contractCreator/ContractCreator.sol
        bytes32 salt = _getSalt(_salt, _sender);
        bytes32 rawAddress = keccak256(
            abi.encodePacked(
                bytes1(0xff),
                address(this),
                salt,
                contractCodeHash
        )
        );

        return address(bytes20(rawAddress << 96));
    }

    function _createForwarder(uint256 _salt, address _sender, address _parent) internal returns (address) {
        InitializableForwarder forwarder = _deployForwarder(_salt, _sender);
        forwarder.initialize(_parent);
        emit ForwarderCreated(address(forwarder));
        return address(forwarder);
    }

    function _deployForwarder(uint256 _salt, address _sender) internal returns (InitializableForwarder) {
        address payable addr;
        bytes memory code = type(InitializableForwarder).creationCode;
        bytes32 salt = _getSalt(_salt, _sender);

        assembly {
            addr := create2(0, add(code, 0x20), mload(code), salt)
            if iszero(extcodesize(addr)) {
                revert(0, 0)
            }
        }

        return InitializableForwarder(addr);
    }

    function _getSalt(uint256 _salt, address _sender) internal pure returns (bytes32) {
        return keccak256(abi.encodePacked(_salt, _sender));
    }
}

