const mongoose = require('mongoose');

/**
 * Submission Type Enum
 * INITIAL - First submission with starting plantation data
 * FINAL - Final submission after project completion
 */
const SUBMISSION_TYPE = {
  INITIAL: 'INITIAL',
  FINAL: 'FINAL'
};

/**
 * Submission Status Enum
 * PENDING_INITIAL_VERIFICATION - Initial submission waiting for Panchayat
 * PENDING_FINAL_VERIFICATION - Final submission waiting for Panchayat
 * MINTED - Tokens have been minted after final approval
 */
const SUBMISSION_STATUS = {
  SUBMITTED: 'SUBMITTED',
  UNDER_REVIEW: 'UNDER_REVIEW',
  APPROVED: 'APPROVED',
  REJECTED: 'REJECTED',
  MINTED: 'MINTED',
  FAILED: 'FAILED',
  // New statuses for 3-stage workflow
  PENDING_INITIAL_VERIFICATION: 'PENDING_INITIAL_VERIFICATION',
  PENDING_FINAL_VERIFICATION: 'PENDING_FINAL_VERIFICATION'
};

/**
 * Species Type Enum
 */
const SPECIES_TYPES = [
  'Neem',
  'Banyan',
  'Peepal',
  'Tamarind',
  'Mango',
  'Bamboo',
  'Teak',
  'Rosewood',
  'Sandalwood',
  'Oak',
  'Pine',
  'Eucalyptus',
  'Poplar',
  'Other'
];

/**
 * Blockchain Details Schema
 * Stores Ethereum/Blockchain transaction and minting information
 */
const blockchainSchema = new mongoose.Schema({
  txHash: {
    type: String,
    trim: true,
    required: false
  },
  blockNumber: {
    type: Number,
    required: false
  },
  contractAddress: {
    type: String,
    trim: true,
    required: false
  },
  tokenId: {
    type: String,
    trim: true,
    required: false
  },
  gasUsed: {
    type: Number,
    required: false
  },
  mintedAt: {
    type: Date,
    required: false
  },
  network: {
    type: String,
    default: 'ethereum',
    enum: ['ethereum', 'polygon', 'bsc']
  }
}, { _id: false });

/**
 * Main Submission Schema
 */
const submissionSchema = new mongoose.Schema({
  // Reference to the project (optional for your use case)
  projectId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Project',
    required: false,
    index: true
  },
  
  // Reference to the NGO/User submitting (optional for your use case)
  ngoId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: false,
    index: true
  },
  
  // NEW: Submission Type - INITIAL or FINAL
  // This distinguishes between the first submission and final completion submission
  submissionType: {
    type: String,
    enum: Object.values(SUBMISSION_TYPE),
    required: false, // Made optional for backward compatibility
    index: true
  },
  
  // File metadata
  fileName: {
    type: String,
    required: [true, 'File name is required'],
    trim: true,
    maxlength: [255, 'File name cannot exceed 255 characters']
  },
  fileType: {
    type: String,
    required: [true, 'File type is required'],
    trim: true
  },
  fileSize: {
    type: Number,
    required: [true, 'File size is required'],
    min: [1, 'File size must be greater than 0']
  },
  filePath: {
    type: String,
    trim: true
  },
  
  // IPFS storage
  ipfsHash: {
    type: String,
    required: [true, 'IPFS Hash is required'],
    trim: true,
    index: true
  },
  ipfsUrl: {
    type: String,
    trim: true
  },
  
  // Carbon credits information
  carbonAmount: {
    type: Number,
    required: false,
    min: [0, 'Carbon amount cannot be negative'],
    default: 0
  },
  creditsIssued: {
    type: Number,
    required: false,
    min: [0, 'Credits issued cannot be negative'],
    default: 0
  },
  
  // Submission status
  status: {
    type: String,
    enum: Object.values(SUBMISSION_STATUS),
    default: SUBMISSION_STATUS.SUBMITTED,
    index: true
  },
  
  // Remarks/notes about the submission
  remarks: {
    type: String,
    trim: true,
    maxlength: [1000, 'Remarks cannot exceed 1000 characters'],
    required: false
  },
  
  // Blockchain details (filled after minting)
  blockchain: {
    type: blockchainSchema,
    required: false
  },
  
  // Submission metadata
  submittedAt: {
    type: Date,
    default: Date.now
  },
  reviewedAt: {
    type: Date,
    required: false
  },
  reviewedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: false
  },
  
  // Legacy fields (for backward compatibility)
  submissionId: {
    type: String,
    unique: true,
    sparse: true
  },
  submittedDate: {
    type: Date,
    required: false
  },
  mintingStatus: {
    type: String,
    enum: ['Not Minted', 'Ready for Minting', 'pending', 'completed', 'failed'],
    default: 'Not Minted'
  },
  
  // Panchayat Remarks
  panchayatRemarks: {
    type: String,
    trim: true,
    maxlength: [1000, 'Remarks cannot exceed 1000 characters'],
    required: false
  },
  
  // Panchayat Verification Fields
  verifiedBy: {
    type: String,
    trim: true,
    required: false
  },
  verifiedAt: {
    type: Date,
    required: false
  },

  // NEW FIELDS: Tree Plantation Data (as per user requirements)
  project: {
    type: String,
    trim: true,
    required: [true, 'Project name is required'],
    maxlength: [255, 'Project name cannot exceed 255 characters']
  },
  latitude: {
    type: Number,
    required: [true, 'Latitude is required'],
    min: -90,
    max: 90
  },
  longitude: {
    type: Number,
    required: [true, 'Longitude is required'],
    min: -180,
    max: 180
  },
  areaCovered: {
    type: Number,
    required: [true, 'Area covered is required'],
    min: [0, 'Area covered cannot be negative']
  },
  saplingsPlanted: {
    type: Number,
    required: [true, 'Number of saplings planted is required'],
    min: [0, 'Saplings planted cannot be negative']
  },
  speciesType: {
    type: String,
    trim: true,
    required: [true, 'Species type is required'],
    maxlength: [100, 'Species type cannot exceed 100 characters']
  }
}, {
  timestamps: true
});

// Compound indexes for efficient queries
submissionSchema.index({ projectId: 1, status: 1 });
submissionSchema.index({ ngoId: 1, createdAt: -1 });
submissionSchema.index({ status: 1, createdAt: -1 });
submissionSchema.index({ 'blockchain.txHash': 1 });
submissionSchema.index({ 'blockchain.tokenId': 1 });
// NEW: Compound index for filtering by submission type and status
submissionSchema.index({ submissionType: 1, status: 1 });
submissionSchema.index({ projectId: 1, submissionType: 1 });

// Virtual for IPFS gateway URL (fallback)
submissionSchema.virtual('gatewayUrl').get(function() {
  if (this.ipfsHash) {
    return `https://gateway.pinata.cloud/ipfs/${this.ipfsHash}`;
  }
  return null;
});

// Generate submission ID before saving
submissionSchema.pre('save', async function(next) {
  if (!this.submissionId) {
    const count = await mongoose.model('Submission').countDocuments();
    this.submissionId = `SUB-${Date.now()}-${count + 1}`;
  }
  if (!this.submittedDate) {
    this.submittedDate = this.createdAt;
  }
  if (this.ipfsHash && !this.ipfsUrl) {
    this.ipfsUrl = `https://gateway.pinata.cloud/ipfs/${this.ipfsHash}`;
  }
  next();
});

// Ensure virtuals are included in JSON
submissionSchema.set('toJSON', { virtuals: true });
submissionSchema.set('toObject', { virtuals: true });

// Static method to get status enum
submissionSchema.statics.getStatusEnum = () => SUBMISSION_STATUS;

// Instance method to update status
submissionSchema.methods.updateStatus = async function(newStatus, reviewedBy = null) {
  if (!Object.values(SUBMISSION_STATUS).includes(newStatus)) {
    throw new Error('Invalid status');
  }
  
  this.status = newStatus;
  
  if ([SUBMISSION_STATUS.APPROVED, SUBMISSION_STATUS.REJECTED].includes(newStatus)) {
    this.reviewedAt = new Date();
    if (reviewedBy) {
      this.reviewedBy = reviewedBy;
    }
  }
  
  await this.save();
  return this;
};

// Instance method to store blockchain details
submissionSchema.methods.storeMintingDetails = async function(blockchainData) {
  this.blockchain = {
    txHash: blockchainData.txHash,
    blockNumber: blockchainData.blockNumber,
    contractAddress: blockchainData.contractAddress,
    tokenId: blockchainData.tokenId,
    gasUsed: blockchainData.gasUsed,
    mintedAt: new Date(),
    network: blockchainData.network || 'ethereum'
  };
  this.status = SUBMISSION_STATUS.MINTED;
  this.mintingStatus = 'completed';
  
  await this.save();
  return this;
};

const Submission = mongoose.model('Submission', submissionSchema);

module.exports = Submission;
module.exports.SUBMISSION_STATUS = SUBMISSION_STATUS;
module.exports.SUBMISSION_TYPE = SUBMISSION_TYPE;
