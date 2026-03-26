# TODO: Integrate Blockchain Storage for Important Data

## Status: ✅ COMPLETED

## What Was Fixed

The project approval process now stores important data in the blockchain!

### Changes Made to `Backend/controllers/projectController.js`:

1. **Added Blockchain Configuration**
   - Added `BLOCKCHAIN_CONFIG` object with:
     - RPC URL (Ganache)
     - Chain ID
     - Contract addresses (to be updated after Truffle migrate)
     - Owner private key (from Ganache)

2. **Modified `approveInitialSubmission` function**:
   - Now calls `/api/blockchain/create-project` to create project on blockchain
   - Calls `/api/blockchain/verify-initial` to verify initially
   - Stores `projectIdOnChain` and `initialVerificationTx` in MongoDB
   - Returns blockchain transaction details in response

3. **Modified `approveFinalSubmission` function**:
   - Now calls `/api/blockchain/verify-final` to verify and mint credits
   - This also mints the NFT for the project
   - Stores `txHash`, `blockNumber`, `tokenId`, `contractAddress` in MongoDB
   - Stores `creditsMinted` on blockchain
   - Returns blockchain transaction details in response

### How It Works Now:

1. **NGO submits plantation data** → Stored in MongoDB + IPFS
2. **Panchayat approves initial** → 
   - Data stored on blockchain (`createProject` + `verifyInitial`)
   - Transaction hash saved to MongoDB
3. **Panchayat approves final** → 
   - Credits minted on blockchain (`verifyFinalAndMint`)
   - NFT created for project
   - Transaction hash and token ID saved to MongoDB

### Important Configuration Required:

You need to set these environment variables in `.env` file:

```env
# Blockchain RPC URL
BLOCKCHAIN_RPC_URL=http://127.0.0.1:7545

# Chain ID (1337 for Ganache)
BLOCKCHAIN_CHAIN_ID=1337

# Contract addresses (UPDATE AFTER running truffle migrate)
CARBON_CREDIT_SYSTEM_ADDRESS=0x...
CARBON_CREDIT_TOKEN_ADDRESS=0x...
CARBON_PROJECT_NFT_ADDRESS=0x...

# Owner private key (FROM GANACHE - account[0])
OWNER_PRIVATE_KEY=0x...
```

### Testing the Flow:

1. Start Ganache
2. Run Truffle migrate to deploy contracts
3. Update contract addresses in `.env`
4. Start backend server
5. Test the full flow from frontend

### Optional: Skip Blockchain

If blockchain is not available, you can pass `skipBlockchain: true` in the request body to skip blockchain storage and only save to MongoDB.

