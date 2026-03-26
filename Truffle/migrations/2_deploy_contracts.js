const CarbonCreditToken = artifacts.require("CarbonCreditToken");
const CarbonProjectNFT = artifacts.require("CarbonProjectNFT");
const CarbonCreditSystem = artifacts.require("CarbonCreditSystem");

module.exports = async function (deployer) {

  // Deploy Token
  await deployer.deploy(CarbonCreditToken);
  const token = await CarbonCreditToken.deployed();

  // Deploy NFT
  await deployer.deploy(CarbonProjectNFT);
  const nft = await CarbonProjectNFT.deployed();

  // Deploy System with token & nft addresses
  await deployer.deploy(CarbonCreditSystem, token.address, nft.address);
};