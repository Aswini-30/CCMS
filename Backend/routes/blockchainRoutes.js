/**
 * Blockchain Routes - Backend API for Smart Contract Interactions
 * ===========================================================
 * This file provides REST API endpoints that interact with the blockchain
 * 
 * @version 1.0.0
 * @author DApp Developer
 */

const express = require('express');
const router = express.Router();

// =============================================================================
// CONFIGURATION - Update these after deployment
// =============================================================================

// Contract Addresses (UPDATE AFTER TRUFFLE MIGRATE)
const CONTRACT_ADDRESSES = {
    CarbonCreditToken: '0x6EC0862749140369725Bbf7741076C5B9c7C35D4', // Same as CarbonCreditSystem for this setup
    CarbonProjectNFT: '0x58777AbF5Ab6fbe08D5Ac6056c6bbfbF5b713533', // Same as CarbonCreditSystem for this setup
    CarbonCreditSystem: '0xbEcC306463D1e9a31c859C2Aedb56022145F92d4'  // User provided address
};

// Web3 Configuration
const WEB3_CONFIG = {
    // Ganache local network
    rpcUrl: 'http://127.0.0.1:7545',
    chainId: 1337 // 0x539 in hex
};

// =============================================================================
// WEB3 INITIALIZATION (Server-side)
// =============================================================================

let web3;
let carbonSystem;
let carbonToken;
let projectNFT;

const initWeb3 = () => {
    const {Web3} = require('web3');
    
    // Initialize Web3 with HTTP provider (Ganache)
    // For Web3 v4.x, use new Web3(url) or new Web3.HTTPProvider(url)
    web3 = new Web3(WEB3_CONFIG.rpcUrl);
    
    // Load ABIs (these should be in separate files in production)
    let CarbonCreditSystemABI, CarbonCreditTokenABI, CarbonProjectNFTABI;
    
    try {
        CarbonCreditSystemABI = require('../abi/CarbonCreditSystem.json').abi;
        CarbonCreditTokenABI = require('../abi/CarbonCreditToken.json').abi;
        CarbonProjectNFTABI = require('../abi/CarbonProjectNFT.json').abi;
    } catch (e) {
        console.log('⚠️  ABI files not found, using inline ABIs');
        // Use minimal ABIs for basic functionality
        CarbonCreditSystemABI = getCarbonCreditSystemABI();
        CarbonCreditTokenABI = getCarbonCreditTokenABI();
        CarbonProjectNFTABI = getCarbonProjectNFTABI();
    }
    
    // Initialize contracts
    carbonSystem = new web3.eth.Contract(
        CarbonCreditSystemABI,
        CONTRACT_ADDRESSES.CarbonCreditSystem
    );
    
    carbonToken = new web3.eth.Contract(
        CarbonCreditTokenABI,
        CONTRACT_ADDRESSES.CarbonCreditToken
    );
    
    projectNFT = new web3.eth.Contract(
        CarbonProjectNFTABI,
        CONTRACT_ADDRESSES.CarbonProjectNFT
    );
    
    console.log('✅ Web3 initialized on backend');
    return web3;
};

// Initialize on module load (wrapped in try-catch)
let web3Instance = null;
try {
    web3Instance = initWeb3();
} catch (error) {
    console.log('⚠️  Web3 initialization skipped:', error.message);
}

// Minimal inline ABIs in case files don't exist
function getCarbonCreditSystemABI() {
    return [{"inputs":[{"internalType":"address","name":"_token","type":"address"},{"internalType":"address","name":"_nft","type":"address"}],"stateMutability":"nonpayable","type":"constructor"},{"anonymous":false,"inputs":[{"indexed":false,"internalType":"uint256","name":"projectId","type":"uint256"},{"indexed":false,"internalType":"address","name":"ngo","type":"address"}],"name":"ProjectCreated","type":"event"},{"anonymous":false,"inputs":[{"indexed":false,"internalType":"uint256","name":"projectId","type":"uint256"}],"name":"InitialVerified","type":"event"},{"anonymous":false,"inputs":[{"indexed":false,"internalType":"uint256","name":"projectId","type":"uint256"}],"name":"FinalVerified","type":"event"},{"anonymous":false,"inputs":[{"indexed":false,"internalType":"uint256","name":"projectId","type":"uint256"},{"indexed":false,"internalType":"uint256","name":"credits","type":"uint256"}],"name":"CreditsMinted","type":"event"},{"inputs":[],"name":"carbonToken","outputs":[{"internalType":"contract CarbonCreditToken","name":"","type":"address"}],"stateMutability":"view","type":"function"},{"inputs":[],"name":"creditPrice","outputs":[{"internalType":"uint256","name":"","type":"uint256"}],"stateMutability":"view","type":"function"},{"inputs":[],"name":"owner","outputs":[{"internalType":"address","name":"","type":"address"}],"stateMutability":"view","type":"function"},{"inputs":[{"internalType":"uint256","name":"","type":"uint256"}],"name":"projects","outputs":[{"internalType":"uint256","name":"projectId","type":"uint256"},{"internalType":"string","name":"projectName","type":"string"},{"internalType":"address","name":"ngoDeveloper","type":"address"},{"internalType":"uint256","name":"carbonAmount","type":"uint256"},{"internalType":"uint256","name":"creditsIssued","type":"uint256"},{"internalType":"string","name":"ipfsHashInitial","type":"string"},{"internalType":"string","name":"ipfsHashFinal","type":"string"},{"internalType":"address","name":"verifiedByInitial","type":"address"},{"internalType":"uint256","name":"verifiedAtInitial","type":"uint256"},{"internalType":"address","name":"verifiedByFinal","type":"address"},{"internalType":"uint256","name":"verifiedAtFinal","type":"uint256"},{"internalType":"uint256","name":"nftTokenId","type":"uint256"}],"stateMutability":"view","type":"function"},{"inputs":[{"internalType":"uint256","name":"","type":"uint256"}],"name":"projectStatus","outputs":[{"internalType":"enum CarbonCreditSystem.ProjectStatus","name":"","type":"uint8"}],"stateMutability":"view","type":"function"},{"inputs":[{"internalType":"address","name":"","type":"address"},{"internalType":"uint256","name":"","type":"uint256"}],"name":"ngoProjects","outputs":[{"internalType":"uint256","name":"","type":"uint256"}],"stateMutability":"view","type":"function"},{"inputs":[{"internalType":"uint256","name":"_projectId","type":"uint256"},{"internalType":"string","name":"_projectName","type":"string"},{"internalType":"address","name":"_ngoDeveloper","type":"address"},{"internalType":"uint256","name":"_carbonAmount","type":"uint256"},{"internalType":"string","name":"_ipfsHash","type":"string"}],"name":"createProject","outputs":[],"stateMutability":"nonpayable","type":"function"},{"inputs":[{"internalType":"uint256","name":"_projectId","type":"uint256"}],"name":"verifyInitial","outputs":[],"stateMutability":"nonpayable","type":"function"},{"inputs":[{"internalType":"uint256","name":"_projectId","type":"uint256"}],"name":"verifyFinalAndMint","outputs":[],"stateMutability":"nonpayable","type":"function"},{"inputs":[{"internalType":"uint256","name":"amount","type":"uint256"}],"name":"purchaseCredits","outputs":[],"stateMutability":"payable","type":"function"}];
}

function getCarbonCreditTokenABI() {
    return [{"inputs":[],"stateMutability":"nonpayable","type":"constructor"},{"anonymous":false,"inputs":[{"indexed":true,"internalType":"address","name":"owner","type":"address"},{"indexed":true,"internalType":"address","name":"spender","type":"address"},{"indexed":false,"internalType":"uint256","name":"value","type":"uint256"}],"name":"Approval","type":"event"},{"anonymous":false,"inputs":[{"indexed":true,"internalType":"address","name":"from","type":"address"},{"indexed":true,"internalType":"address","name":"to","type":"address"},{"indexed":false,"internalType":"uint256","name":"value","type":"uint256"}],"name":"Transfer","type":"event"},{"inputs":[{"internalType":"address","name":"owner","type":"address"},{"internalType":"address","name":"spender","type":"address"}],"name":"allowance","outputs":[{"internalType":"uint256","name":"","type":"uint256"}],"stateMutability":"view","type":"function"},{"inputs":[{"internalType":"address","name":"spender","type":"address"},{"internalType":"uint256","name":"amount","type":"uint256"}],"name":"approve","outputs":[{"internalType":"bool","name":"","type":"bool"}],"stateMutability":"nonpayable","type":"function"},{"inputs":[{"internalType":"address","name":"account","type":"address"}],"name":"balanceOf","outputs":[{"internalType":"uint256","name":"","type":"uint256"}],"stateMutability":"view","type":"function"},{"inputs":[],"name":"decimals","outputs":[{"internalType":"uint8","name":"","type":"uint8"}],"stateMutability":"view","type":"function"},{"inputs":[],"name":"name","outputs":[{"internalType":"string","name":"","type":"string"}],"stateMutability":"view","type":"function"},{"inputs":[],"name":"symbol","outputs":[{"internalType":"string","name":"","type":"string"}],"stateMutability":"view","type":"function"},{"inputs":[],"name":"totalSupply","outputs":[{"internalType":"uint256","name":"","type":"uint256"}],"stateMutability":"view","type":"function"},{"inputs":[{"internalType":"address","name":"to","type":"address"},{"internalType":"uint256","name":"amount","type":"uint256"}],"name":"transfer","outputs":[{"internalType":"bool","name":"","type":"bool"}],"stateMutability":"nonpayable","type":"function"},{"inputs":[{"internalType":"address","name":"to","type":"address"},{"internalType":"uint256","name":"amount","type":"uint256"}],"name":"mintCredits","outputs":[],"stateMutability":"nonpayable","type":"function"}];
}

function getCarbonProjectNFTABI() {
    return [{"inputs":[],"stateMutability":"nonpayable","type":"constructor"},{"anonymous":false,"inputs":[{"indexed":true,"internalType":"address","name":"owner","type":"address"},{"indexed":true,"internalType":"address","name":"approved","type":"address"},{"indexed":true,"internalType":"uint256","name":"tokenId","type":"uint256"}],"name":"Approval","type":"event"},{"anonymous":false,"inputs":[{"indexed":true,"internalType":"address","name":"owner","type":"address"},{"indexed":true,"internalType":"address","name":"operator","type":"address"},{"indexed":false,"internalType":"bool","name":"approved","type":"bool"}],"name":"ApprovalForAll","type":"event"},{"anonymous":false,"inputs":[{"indexed":true,"internalType":"address","name":"from","type":"address"},{"indexed":true,"internalType":"address","name":"to","type":"address"},{"indexed":true,"internalType":"uint256","name":"tokenId","type":"uint256"}],"name":"Transfer","type":"event"},{"inputs":[{"internalType":"address","name":"owner","type":"address"}],"name":"balanceOf","outputs":[{"internalType":"uint256","name":"","type":"uint256"}],"stateMutability":"view","type":"function"},{"inputs":[{"internalType":"uint256","name":"tokenId","type":"uint256"}],"name":"ownerOf","outputs":[{"internalType":"address","name":"","type":"address"}],"stateMutability":"view","type":"function"},{"inputs":[{"internalType":"address","name":"to","type":"address"}],"name":"mintProjectNFT","outputs":[{"internalType":"uint256","name":"","type":"uint256"}],"stateMutability":"nonpayable","type":"function"},{"inputs":[],"name":"nextTokenId","outputs":[{"internalType":"uint256","name":"","type":"uint256"}],"stateMutability":"view","type":"function"}];
}

// =============================================================================
// HELPER FUNCTIONS
// =============================================================================

/**
 * Get account from private key
 * @param {string} privateKey - Account private key
 * @returns {Object} Account object with address
 */
const getAccountFromPrivateKey = (privateKey) => {
    const account = web3.eth.accounts.privateKeyToAccount(privateKey);
    return account;
};

/**
 * Sign and send a transaction
 * @param {Object} contract - Web3 contract instance
 * @param {string} methodName - Contract method name
 * @param {Array} params - Method parameters
 * @param {string} fromAddress - Sender address
 * @param {string} privateKey - Sender private key
 * @param {number} gas - Gas limit
 */
const sendTransaction = async (contract, methodName, params, fromAddress, privateKey, gas = 2000000) => {
    try {
        const method = contract.methods[methodName](...params);
        
        const gasEstimate = await method.estimateGas({ from: fromAddress });
        
        const tx = {
            from: fromAddress,
            to: contract.options.address,
            data: method.encodeABI(),
            gas: Math.floor(gasEstimate * 1.2), // Add 20% buffer
            chainId: WEB3_CONFIG.chainId
        };
        
        const signedTx = await web3.eth.accounts.signTransaction(tx, privateKey);
        const receipt = await web3.eth.sendSignedTransaction(signedTx.rawTransaction);
        
        return receipt;
    } catch (error) {
        console.error('Transaction failed:', error);
        throw error;
    }
};

// =============================================================================
// API ROUTES
// =============================================================================

/**
 * GET /api/blockchain/status
 * Get blockchain connection status
 */
router.get('/status', async (req, res) => {
    try {
        const networkId = Number(await web3.eth.net.getId());
        const blockNumber = Number(await web3.eth.getBlockNumber());
        const isListening = await web3.eth.net.isListening();
        
        res.json({
            success: true,
            data: {
                connected: isListening,
                networkId: networkId,
                blockNumber: blockNumber,
                contracts: {
                    CarbonCreditSystem: CONTRACT_ADDRESSES.CarbonCreditSystem,
                    CarbonCreditToken: CONTRACT_ADDRESSES.CarbonCreditToken,
                    CarbonProjectNFT: CONTRACT_ADDRESSES.CarbonProjectNFT
                }
            }
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Failed to connect to blockchain',
            error: error.message
        });
    }
});

/**
 * GET /api/blockchain/balance/:address
 * Get ETH balance for an address
 */
router.get('/balance/:address', async (req, res) => {
    try {
        const { address } = req.params;
        
        const balance = await web3.eth.getBalance(address);
        const balanceInEth = web3.utils.fromWei(balance, 'ether');
        
        res.json({
            success: true,
            data: {
                address: address,
                balance: balance,
                balanceInEth: balanceInEth
            }
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Failed to get balance',
            error: error.message
        });
    }
});

/**
 * POST /api/blockchain/create-project
 * Create a new carbon credit project
 * 
 * Body:
 * {
 *   projectId: number,
 *   projectName: string,
 *   ngoDeveloper: string,
 *   carbonAmount: number,
 *   ipfsHash: string,
 *   ownerPrivateKey: string
 * }
 */
router.post('/create-project', async (req, res) => {
    try {
        const { 
            projectId, 
            projectName, 
            ngoDeveloper, 
            carbonAmount, 
            ipfsHash,
            ownerPrivateKey 
        } = req.body;
        
        // Validate required fields
        if (!projectId || !projectName || !ngoDeveloper || !carbonAmount || !ownerPrivateKey) {
            return res.status(400).json({
                success: false,
                message: 'Missing required fields'
            });
        }
        
        // Get owner address from private key
        const account = getAccountFromPrivateKey(ownerPrivateKey);
        
        // Send transaction
        const receipt = await sendTransaction(
            carbonSystem,
            'createProject',
            [projectId, projectName, ngoDeveloper, carbonAmount, ipfsHash || ''],
            account.address,
            ownerPrivateKey
        );
        
        res.json({
            success: true,
            message: 'Project created successfully',
            data: {
                transactionHash: receipt.transactionHash,
                blockNumber: receipt.blockNumber,
                projectId: projectId
            }
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Failed to create project',
            error: error.message
        });
    }
});

/**
 * POST /api/blockchain/verify-initial
 * Verify a project initially (Owner only)
 * 
 * Body:
 * {
 *   projectId: number,
 *   ownerPrivateKey: string
 * }
 */
router.post('/verify-initial', async (req, res) => {
    try {
        const { projectId, ownerPrivateKey } = req.body;
        
        if (!projectId || !ownerPrivateKey) {
            return res.status(400).json({
                success: false,
                message: 'Missing required fields'
            });
        }
        
        const account = getAccountFromPrivateKey(ownerPrivateKey);
        
        const receipt = await sendTransaction(
            carbonSystem,
            'verifyInitial',
            [projectId],
            account.address,
            ownerPrivateKey,
            1000000
        );
        
        res.json({
            success: true,
            message: 'Project verified initially',
            data: {
                transactionHash: receipt.transactionHash,
                blockNumber: receipt.blockNumber,
                projectId: projectId
            }
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Failed to verify project',
            error: error.message
        });
    }
});

/**
 * POST /api/blockchain/verify-final
 * Verify project finally and mint credits (Owner only)
 * 
 * Body:
 * {
 *   projectId: number,
 *   ownerPrivateKey: string
 * }
 */
router.post('/verify-final', async (req, res) => {
    try {
        const { projectId, ownerPrivateKey } = req.body;
        
        if (!projectId || !ownerPrivateKey) {
            return res.status(400).json({
                success: false,
                message: 'Missing required fields'
            });
        }
        
        const account = getAccountFromPrivateKey(ownerPrivateKey);
        
        const receipt = await sendTransaction(
            carbonSystem,
            'verifyFinalAndMint',
            [projectId],
            account.address,
            ownerPrivateKey,
            3000000
        );
        
        res.json({
            success: true,
            message: 'Project verified and credits minted',
            data: {
                transactionHash: receipt.transactionHash,
                blockNumber: receipt.blockNumber,
                projectId: projectId
            }
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Failed to verify and mint',
            error: error.message
        });
    }
});

/**
 * POST /api/blockchain/purchase-credits
 * Purchase carbon credits
 * 
 * Body:
 * {
 *   amount: number,
 *   buyerPrivateKey: string
 * }
 */
router.post('/purchase-credits', async (req, res) => {
    try {
        const { amount, buyerPrivateKey } = req.body;
        
        if (!amount || !buyerPrivateKey) {
            return res.status(400).json({
                success: false,
                message: 'Missing required fields'
            });
        }
        
        const account = getAccountFromPrivateKey(buyerPrivateKey);
        
        // Get credit price
        const price = await carbonSystem.methods.creditPrice().call();
        const totalValue = web3.utils.toWei((amount * parseFloat(web3.utils.fromWei(price, 'ether'))).toString(), 'ether');
        
        // Send transaction with ETH value
        const method = carbonSystem.methods.purchaseCredits(amount);
        const gasEstimate = await method.estimateGas({ 
            from: account.address, 
            value: totalValue 
        });
        
        const tx = {
            from: account.address,
            to: carbonSystem.options.address,
            data: method.encodeABI(),
            value: totalValue,
            gas: Math.floor(gasEstimate * 1.2),
            chainId: WEB3_CONFIG.chainId
        };
        
        const signedTx = await web3.eth.accounts.signTransaction(tx, buyerPrivateKey);
        const receipt = await web3.eth.sendSignedTransaction(signedTx.rawTransaction);
        
        res.json({
            success: true,
            message: 'Credits purchased successfully',
            data: {
                transactionHash: receipt.transactionHash,
                blockNumber: receipt.blockNumber,
                amount: amount,
                totalValue: web3.utils.fromWei(totalValue, 'ether')
            }
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Failed to purchase credits',
            error: error.message
        });
    }
});

/**
 * GET /api/blockchain/project/:id
 * Get project details
 */
router.get('/project/:id', async (req, res) => {
    try {
        const { id } = req.params;
        
        const project = await carbonSystem.methods.projects(id).call();
        const status = await carbonSystem.methods.projectStatus(id).call();
        
        const statusText = ['Created', 'Initial Verified', 'Final Verified', 'Credits Issued'];
        
        res.json({
            success: true,
            data: {
                projectId: project.projectId,
                projectName: project.projectName,
                ngoDeveloper: project.ngoDeveloper,
                carbonAmount: project.carbonAmount,
                creditsIssued: project.creditsIssued,
                ipfsHashInitial: project.ipfsHashInitial,
                ipfsHashFinal: project.ipfsHashFinal,
                verifiedByInitial: project.verifiedByInitial,
                verifiedAtInitial: project.verifiedAtInitial,
                verifiedByFinal: project.verifiedByFinal,
                verifiedAtFinal: project.verifiedAtFinal,
                nftTokenId: project.nftTokenId,
                status: statusText[status]
            }
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Failed to get project',
            error: error.message
        });
    }
});

/**
 * GET /api/blockchain/projects/:ngoAddress
 * Get all projects for an NGO
 */
router.get('/projects/:ngoAddress', async (req, res) => {
    try {
        const { ngoAddress } = req.params;
        
        const projectIds = await carbonSystem.methods.ngoProjects(ngoAddress).call();
        
        const projects = [];
        for (const id of projectIds) {
            const project = await carbonSystem.methods.projects(id).call();
            const status = await carbonSystem.methods.projectStatus(id).call();
            projects.push({
                projectId: id,
                ...project,
                status: status
            });
        }
        
        res.json({
            success: true,
            data: {
                ngoAddress: ngoAddress,
                count: projects.length,
                projects: projects
            }
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Failed to get projects',
            error: error.message
        });
    }
});

/**
 * GET /api/blockchain/token-balance/:address
 * Get carbon token balance for an address
 */
router.get('/token-balance/:address', async (req, res) => {
    try {
        const { address } = req.params;
        
        const balance = await carbonToken.methods.balanceOf(address).call();
        
        res.json({
            success: true,
            data: {
                address: address,
                balance: balance,
                balanceInTokens: web3.utils.fromWei(balance, 'ether')
            }
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Failed to get token balance',
            error: error.message
        });
    }
});

/**
 * GET /api/blockchain/nft-balance/:address
 * Get NFT balance for an address
 */
router.get('/nft-balance/:address', async (req, res) => {
    try {
        const { address } = req.params;
        
        const balance = await projectNFT.methods.balanceOf(address).call();
        
        res.json({
            success: true,
            data: {
                address: address,
                balance: balance
            }
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Failed to get NFT balance',
            error: error.message
        });
    }
});

/**
 * GET /api/blockchain/credit-price
 * Get current credit price
 */
router.get('/credit-price', async (req, res) => {
    try {
        const price = await carbonSystem.methods.creditPrice().call();
        
        res.json({
            success: true,
            data: {
                price: price,
                priceInEth: web3.utils.fromWei(price, 'ether')
            }
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Failed to get credit price',
            error: error.message
        });
    }
});

/**
 * GET /api/blockchain/contract-owner
 * Get contract owner address
 */
router.get('/contract-owner', async (req, res) => {
    try {
        const owner = await carbonSystem.methods.owner().call();
        
        res.json({
            success: true,
            data: {
                owner: owner
            }
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Failed to get contract owner',
            error: error.message
        });
    }
});

/**
 * GET /api/blockchain/events/:eventName
 * Get past events
 * 
 * Query params:
 * - fromBlock: Starting block number (default: 0)
 * - projectId: Filter by project ID (optional)
 */
router.get('/events/:eventName', async (req, res) => {
    try {
        const { eventName } = req.params;
        const { fromBlock = 0, projectId } = req.query;
        
        const validEvents = ['ProjectCreated', 'InitialVerified', 'FinalVerified', 'CreditsMinted'];
        
        if (!validEvents.includes(eventName)) {
            return res.status(400).json({
                success: false,
                message: `Invalid event name. Valid events: ${validEvents.join(', ')}`
            });
        }
        
        let filterOptions = {
            fromBlock: parseInt(fromBlock),
            toBlock: 'latest'
        };
        
        // Add filter for project ID if provided
        if (projectId) {
            filterOptions.projectId = parseInt(projectId);
        }
        
        const events = await carbonSystem.getPastEvents(eventName, filterOptions);
        
        res.json({
            success: true,
            data: {
                eventName: eventName,
                count: events.length,
                events: events.map(e => ({
                    transactionHash: e.transactionHash,
                    blockNumber: e.blockNumber,
                    returnValues: e.returnValues
                }))
            }
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Failed to get events',
            error: error.message
        });
    }
});

module.exports = router;

