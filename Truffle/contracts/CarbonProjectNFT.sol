// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

contract CarbonProjectNFT is ERC721, Ownable {

    uint256 public nextTokenId = 1;

    constructor() ERC721("Carbon Project NFT", "CPN") {}

    function mintProjectNFT(address to) external onlyOwner returns(uint256) {

        uint256 tokenId = nextTokenId;

        _safeMint(to, tokenId);

        nextTokenId++;

        return tokenId;
    }
}