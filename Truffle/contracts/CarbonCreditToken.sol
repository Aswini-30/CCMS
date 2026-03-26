// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

contract CarbonCreditToken is ERC20, Ownable {

   constructor() ERC20("Carbon Credit Token", "CCT")  {}

    function mintCredits(address to, uint256 amount) external onlyOwner {
        _mint(to, amount);
    }

    function burnCredits(uint256 amount) external {
        _burn(msg.sender, amount);
    }
}