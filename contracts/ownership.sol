// SPDX-License-Identifier: MIT
pragma solidity ^0.8.27;

import "@openzeppelin/contracts/access/Ownable.sol";

contract Ownership is Ownable {
    constructor() Ownable(msg.sender) {}

 

}
