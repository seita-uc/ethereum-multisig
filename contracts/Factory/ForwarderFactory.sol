pragma solidity ^0.5.6;

import "../Forwarder/Forwarder.sol";
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
            type(I).creationCode
        );
    }

    function createForwarder(uint256 _salt, address _parent) public {
        return _createForwarder(_salt, msg.sender, _owner1, _owner2);
    }

    function createWallet(uint256 _salt, address _owner1, address _owner2) public returns (address) {
        return _createWallet(_salt, msg.sender, _owner1, _owner2);
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

    function _createWallet(uint256 _salt, address _sender, address _owner1, address _owner2) internal returns (address) {
        InitializableMultiSig2of2 wallet = _deployWallet(_salt, _sender);
        wallet.initialize(_owner1, _owner2);
        emit WalletCreated(address(wallet));
        return address(wallet);
    }

    function _deployWallet(uint256 _salt, address _sender) internal returns (InitializableMultiSig2of2) {
        address payable addr;
        bytes memory code = type(InitializableMultiSig2of2).creationCode;
        bytes32 salt = _getSalt(_salt, _sender);

        assembly {
            addr := create2(0, add(code, 0x20), mload(code), salt)
            if iszero(extcodesize(addr)) {
                revert(0, 0)
            }
        }

        return InitializableMultiSig2of2(addr);
    }

    function _getSalt(uint256 _salt, address _sender) internal pure returns (bytes32) {
        return keccak256(abi.encodePacked(_salt, _sender));
    }
}

