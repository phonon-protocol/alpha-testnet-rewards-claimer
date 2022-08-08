//SPDX-License-Identifier: MIT  
pragma solidity ^0.8.11;  
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/cryptography/MerkleProof.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";

///////////////////////////////////////////////////////////////
//  ____  _                               ____    _    ___   //
// |  _ \| |__   ___  _ __   ___  _ __   |  _ \  / \  / _ \  //
// | |_) | '_ \ / _ \| '_ \ / _ \| '_ \  | | | |/ _ \| | | | //
// |  __/| | | | (_) | | | | (_) | | | | | |_| / ___ \ |_| | //
// |_|   |_| |_|\___/|_| |_|\___/|_| |_| |____/_/   \_\___/  //
//                                                           //
///////////////////////////////////////////////////////////////

/// @title PhononDAOTestnetRewardsClaimer
/// @notice allows Phonon Protcol Testnet participates to claim their PHONON rewards.
/// @author hinchy.eth
contract PhononDAOTestnetRewardsClaimer is Ownable {

  /// @notice PHONON token
  IERC20 public immutable token;
  /// @notice merkle tree root hash as hex string
  bytes32 public immutable allowList;

  /// @notice mapping of addresses that have claimed tokens
  mapping(address => bool) public hasClaimed;

  /// @param _token PHONON token address
  /// @param _daoMultiSig PhononDAO multi sig address
  /// @param _allowList merkle tree root hash as hex string
  constructor(
    address _token,
    address _daoMultiSig,
    bytes32 _allowList
  ) {
    token = IERC20(_token);
    allowList = _allowList;
    // set the PhononDAO multi sig as owner of contract
    transferOwnership(_daoMultiSig);
  }

  /// @notice allows an account to claim PHONON
  /// @param amount amount of tokens owed to claimee
  /// @param proof merkle proof to prove address and amount are part of merkle tree
  function claim(uint256 amount, bytes32[] calldata proof) external {
    // revert if account has already claimed tokens
    require(!hasClaimed[msg.sender], "Already claimed");

    // revert if PHONON balance isn't sufficient
    require(token.balanceOf(address(this)) >= amount, "Insufficient balance");

    // revert if not part of merkle tree
    bytes32 leaf = keccak256(abi.encodePacked(msg.sender, amount));
    bool isValidLeaf = MerkleProof.verify(proof, allowList, leaf);
    require(isValidLeaf, "Invalid proof");

    // set account as claimed
    hasClaimed[msg.sender] = true;

    // send PHONON to account
    token.transfer(msg.sender, amount);
  }

  /// @notice allows the multi sig to withdraw all PHONON balance
  function withdraw() public onlyOwner {
    token.transfer(owner(), token.balanceOf(address(this)));
  }
}