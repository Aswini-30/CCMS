// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "./CarbonCreditToken.sol";
import "./CarbonProjectNFT.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/security/ReentrancyGuard.sol";

contract CarbonCreditSystem is Ownable, ReentrancyGuard {

    CarbonCreditToken public carbonToken;
    CarbonProjectNFT public projectNFT;

    uint256 public creditPrice = 0.001 ether;

    enum ProjectStatus {
        CREATED,
        INITIAL_VERIFIED,
        FINAL_VERIFIED,
        CREDITS_ISSUED
    }

    struct Project {

        uint256 projectId;
        string projectName;
        address ngoDeveloper;

        uint256 carbonAmount;
        uint256 creditsIssued;

        string ipfsHashInitial;
        string ipfsHashFinal;

        address verifiedByInitial;
        uint256 verifiedAtInitial;

        address verifiedByFinal;
        uint256 verifiedAtFinal;

        uint256 nftTokenId;
    }

    mapping(uint256 => Project) public projects;
    mapping(uint256 => ProjectStatus) public projectStatus;
    mapping(address => uint256[]) public ngoProjects;

    event ProjectCreated(uint256 projectId, address ngo);
    event InitialVerified(uint256 projectId);
    event FinalVerified(uint256 projectId);
    event CreditsMinted(uint256 projectId, uint256 credits);

    constructor(address _token, address _nft) {

        carbonToken = CarbonCreditToken(_token);
        projectNFT = CarbonProjectNFT(_nft);
    }

    function createProject(
        uint256 _projectId,
        string memory _projectName,
        address _ngoDeveloper,
        uint256 _carbonAmount,
        string memory _ipfsHash
    ) public {

        require(projects[_projectId].projectId == 0, "Project already exists");

        Project storage project = projects[_projectId];

        project.projectId = _projectId;
        project.projectName = _projectName;
        project.ngoDeveloper = _ngoDeveloper;
        project.carbonAmount = _carbonAmount;
        project.ipfsHashInitial = _ipfsHash;

        projectStatus[_projectId] = ProjectStatus.CREATED;

        ngoProjects[_ngoDeveloper].push(_projectId);

        emit ProjectCreated(_projectId, _ngoDeveloper);
    }

    function verifyInitial(uint256 _projectId) public onlyOwner {

        require(projectStatus[_projectId] == ProjectStatus.CREATED, "Project not in CREATED state");

        projects[_projectId].verifiedByInitial = msg.sender;
        projects[_projectId].verifiedAtInitial = block.timestamp;

        projectStatus[_projectId] = ProjectStatus.INITIAL_VERIFIED;

        emit InitialVerified(_projectId);
    }

    function verifyFinalAndMint(uint256 _projectId) public onlyOwner {

        require(projectStatus[_projectId] == ProjectStatus.INITIAL_VERIFIED, "Initial verification required");

        Project storage project = projects[_projectId];

        project.verifiedByFinal = msg.sender;
        project.verifiedAtFinal = block.timestamp;

        uint256 nftId = projectNFT.mintProjectNFT(project.ngoDeveloper);

        project.nftTokenId = nftId;

        uint256 credits = project.carbonAmount * 10**18;

        carbonToken.mintCredits(project.ngoDeveloper, credits);

        project.creditsIssued = credits;

        projectStatus[_projectId] = ProjectStatus.CREDITS_ISSUED;

        emit CreditsMinted(_projectId, credits);
    }

    function purchaseCredits(uint256 amount) public payable nonReentrant {

        require(amount > 0, "Invalid amount");
        require(msg.value >= amount * creditPrice, "Insufficient payment");

        carbonToken.transfer(msg.sender, amount * 10**18);
    }

    function setCreditPrice(uint256 price) public onlyOwner {

        creditPrice = price;
    }

    function withdraw() public onlyOwner {

        payable(owner()).transfer(address(this).balance);
    }
}