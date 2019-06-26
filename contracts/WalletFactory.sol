pragma solidity ^0.4.24;

import "./Wallets/MultiSig2of2.sol";
import "./Ownership/HasNoEther.sol";

/// @title WalletFactory
/// @dev A contract for creating wallets. 
contract WalletFactory is HasNoEther {

    /// @notice Emitted whenever a wallet is created
    /// @param wallet The address of the wallet created
    /// @param authorizedAddress The initial authorized address of the wallet
    /// @param full `true` if the deployed wallet was a full, self
    ///  contained wallet; `false` if the wallet is a clone wallet
    event WalletCreated(address wallet, address owner1, address owner2);

    constructor() public {}

    function deployWallet(
        address _owner1,
        address _owner2,
    )
    public 
    {
        // instantiate full wallet the regular way
        MultiSig2of2 wallet = new MultiSig2of2(_owner1, _owner2);
        // emit event
        emit WalletCreated(address(wallet), _owner1, _owner2);
    }
}
