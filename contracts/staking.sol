// SPDX-License-Identifier: MIT
pragma solidity ^0.8.27;

import "./Token.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "./IToken.sol";

contract StakingContract {
    address[] public TokenList;
    uint8 public decimal;
    address public admin;
    mapping(address => string) public TokenIdea;
    mapping(uint256 => address[]) public startupTokenList;
    mapping(address => address[]) public stakingTokenList;
    mapping(address => uint256[]) public stakingTokenAmount;
    mapping(address => uint256[]) public stakingTokenStartTime;

    event getBalances(uint256 balances);

    constructor(address _admin) {
        admin = _admin;
    }
    //Set Admin
    function setAdmin(address _admin) public {
        require(admin == msg.sender, "caller is not admin");
        admin = _admin;
    }
    //Deposite token in smart contract
    function Deposite(address stakingToken, uint256 amount) public {
        stakingTokenList[msg.sender].push(stakingToken);
        stakingTokenAmount[msg.sender].push(amount);
        stakingTokenStartTime[msg.sender].push(block.timestamp);

        IToken stakingTokenInterface = IToken(stakingToken);
        stakingTokenInterface.transferFrom(msg.sender, address(this), amount);
    }

    //Smart contract will withdraw asset with reward

    function WithDraw(uint8 index, address stakingToken) public {
        uint256 startTime = stakingTokenStartTime[msg.sender][index];
        uint256 currentTime = block.timestamp;
        uint256 lockTime = 3 * 30 * 24 * 3600;
        uint256 amount = stakingTokenAmount[msg.sender][index];
        require(currentTime >= startTime + lockTime, "Lock time not elapsed");

        uint256 difTimestamp = currentTime - startTime;
        uint256 reward = (amount * 5 * difTimestamp) / (365 * 24 * 3600 * 100);

        IToken stakingTokenInterface = IToken(stakingToken);
        stakingTokenInterface.transfer(msg.sender, amount + reward);

        delete stakingTokenList[msg.sender][index];
        delete stakingTokenAmount[msg.sender][index];
        delete stakingTokenStartTime[msg.sender][index];
    }

    //Smart contract will deposite again after getting reward.
    function ReDeposite(uint8 index, address stakingToken) public {
        uint256 startTime = stakingTokenStartTime[msg.sender][index];
        uint256 currentTime = block.timestamp;
        uint256 lockTime = 3 * 30 * 24 * 3600;
        uint256 amount = stakingTokenAmount[msg.sender][index];
        require(currentTime >= startTime + lockTime, "Lock time not elapsed");

        uint256 difTimestamp = currentTime - startTime;
        uint256 reward = (amount * 5 * difTimestamp) / (365 * 24 * 3600 * 100);

        IToken stakingTokenInterface = IToken(stakingToken);
        stakingTokenInterface.transfer(msg.sender, reward);

        stakingTokenStartTime[msg.sender][index] = block.timestamp;
    }

    //Get Staking Token List from Smart contract in client
    function getStakingTokenList() public view returns (address[] memory) {
        return stakingTokenList[msg.sender];
    }

    //Get Staking Token Amount of users in client
    function getStakingTokenAmount() public view returns (uint256[] memory) {
        return stakingTokenAmount[msg.sender];
    }

    //Get Staking Token StartTime of deposite in client
    function getStakingTokenStartTime() public view returns (uint256[] memory) {
        return stakingTokenStartTime[msg.sender];
    }

    function getAddress(
        bytes memory bytecode,
        uint _salt
    ) public view returns (address) {
        bytes32 hash = keccak256(
            abi.encodePacked(
                bytes1(0xff),
                address(this),
                _salt,
                keccak256(bytecode)
            )
        );
        return address(uint160(uint(hash)));
    }

    //Deploy token to target address

    function deploy(bytes memory bytecode, uint salt) public returns (address) {
        address addr;
        assembly {
            addr := create2(0, add(bytecode, 0x20), mload(bytecode), salt)
            if iszero(extcodesize(addr)) {
                revert(0, 0)
            }
        }

        return addr;
    }

    function getBytecode(
        string memory name,
        string memory symbol,
        uint256 initialSupply,
        uint8 decimals
    ) public pure returns (bytes memory) {
        bytes memory bytecode = type(Token).creationCode;
        return
            bytecode = abi.encodePacked(
                bytecode,
                abi.encode(name, symbol, initialSupply, decimals)
            );
    }

    function deployToken(
        string memory name,
        string memory symbol,
        uint256 initialSupply,
        uint8 decimals,
        uint salt
    ) public {
        bytes memory bytecode = type(Token).creationCode;
        bytecode = abi.encodePacked(
            bytecode,
            abi.encode(name, symbol, initialSupply, decimals)
        );
        deploy(bytecode, salt);
    }
}
