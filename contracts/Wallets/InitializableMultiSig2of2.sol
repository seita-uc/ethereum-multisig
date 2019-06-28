pragma solidity ^0.5.6;
import "../Forwarder/Forwarder.sol";

contract MultiSig2of2 {

    bool public initialized = false;

    // The 2 addresses which control the funds in this contract.  The
    // owners of 2 of these addresses will need to both sign a message
    // allowing the funds in this contract to be spent.
    mapping(address => bool) private owners;

    // The contract nonce is not accessible to the contract so we
    // implement a nonce-like variable for replay protection.
    uint256 public spendNonce = 0;

    // Contract Versioning
    uint256 public unchainedMultisigVersionMajor = 2;
    uint256 public unchainedMultisigVersionMinor = 0;

    // An event sent when funds are received.
    event Funded(uint newBalance);

    // An event sent when a spend is triggered to the given address.
    event Spent(address to, uint transfer);

    // An event sent when a forwarder is created.
    event ForwarderCreated(address forwarder);

    // An event sent when initialized.
    event Initialized();

    event DebugBytes32(bytes32 log);
    event DebugBytes(bytes log);
    event DebugAddress(address log);
    event DebugUint8(uint8 log);

    constructor() public {}

    // The fallback function for this contract.
    function() external payable {
        emit Funded(address(this).balance);
    }

    function initialize(address _owner1, address _owner2) public {
        require(!initialized, "1");

        address zeroAddress = address(0);

        require(_owner1 != zeroAddress, "1");
        require(_owner2 != zeroAddress, "1");

        require(_owner1 != _owner2, "1");

        owners[_owner1] = true;
        owners[_owner2] = true;

        initialized = true;
        emit Initialized();
    }

    function createForwarder() public {
        Forwarder forwarder = new Forwarder();
        emit ForwarderCreated(address(forwarder));
    }

    // Generates the message to sign given the output destination address and amount.
    // includes this contract's address and a nonce for replay protection.
    // One option to independently verify:
    //     https://leventozturk.com/engineering/sha3/ and select keccak
    function generateMessageToSign(
        address destination,
        uint256 value
    )
        public view returns (bytes32)
    {
        require(destination != address(this), "2");
        bytes32 message = keccak256(
            abi.encodePacked(
                spendNonce,
                this,
                value,
                destination
            )
        );
        return message;
    }

    // Send the given amount of ETH to the given destination using
    // the two triplets (v1, r1, s1) and (v2, r2, s2) as signatures.
    // s1 and s2 should be 0x00 or 0x01 corresponding to 0x1b and 0x1c respectively.
    function spend(
        address payable destination,
        uint256 value,
        uint8 v1,
        bytes32 r1,
        bytes32 s1,
        uint8 v2,
        bytes32 r2,
        bytes32 s2
    )
        public
    {
        // This require is handled by generateMessageToSign()
        // require(destination != address(this));
        require(address(this).balance >= value, "3");
        require(
            _validSignature(
                destination,
                value,
                v1, r1, s1,
                v2, r2, s2
            ),
            "4");
        spendNonce = spendNonce + 1;
        destination.transfer(value);
        emit Spent(destination, value);
    }

    // Confirm that the two signature triplets (v1, r1, s1) and (v2, r2, s2)
    // both authorize a spend of this contract's funds to the given
    // destination address.
    function _validSignature(
        address destination,
        uint256 value,
        uint8 v1, bytes32 r1, bytes32 s1,
        uint8 v2, bytes32 r2, bytes32 s2
    )
        private view returns (bool)
    {
        bytes32 message = _messageToRecover(destination, value);

        address addr1 = ecrecover(
            message,
            v1, r1, s1
        );
        address addr2 = ecrecover(
            message,
            v2, r2, s2
        );

        require(_distinctOwners(addr1, addr2), "5");

        return true;
    }

    // Generate the the unsigned message (in bytes32) that each owner's
    // wallet would have signed for the given destination and amount.
    //
    // The generated message from generateMessageToSign is converted to
    // ascii when signed by a trezor.
    //
    // The required signing prefix, the length of this
    // unsigned message, and the unsigned ascii message itself are
    // then concatenated and hashed with keccak256.
    function _messageToRecover(
        address destination,
        uint256 value
    )
        private view returns (bytes32)
    {
        bytes32 hashedUnsignedMessage = generateMessageToSign(
            destination,
            value
        );
        bytes memory prefix = "\x19Ethereum Signed Message:\n32";
        return keccak256(abi.encodePacked(prefix, hashedUnsignedMessage));
    }

    // Confirm the pair of addresses as two distinct owners of this contract.
    function _distinctOwners(
        address addr1,
        address addr2
    )
        private view returns (bool)
    {
        // Check that both addresses are different
        require(addr1 != addr2, "5");
        // Check that both addresses are owners
        require(owners[addr1], "5");
        require(owners[addr2], "5");
        return true;
    }
}
