// Industry Dashboard - Carbon Credit Management System
// Main Application JavaScript

const API_BASE_URL = 'http://localhost:5000/api/blockchain';

// Store user session
let userSession = {
    walletAddress: localStorage.getItem('walletAddress') || '',
    industryName: localStorage.getItem('industryName') || '',
    privateKey: localStorage.getItem('privateKey') || ''
};

// Transaction history (stored locally for demo)
let transactionHistory = JSON.parse(localStorage.getItem('transactionHistory') || '[]');

// Initialize the application
document.addEventListener('DOMContentLoaded', () => {
    initializeApp();
});

async function initializeApp() {
    // Check if user is logged in
    if (!userSession.walletAddress) {
        showLoginPrompt();
    } else {
        // Load dashboard data
        await loadDashboardData();
        await loadProjects();
        await loadTransactions();
    }
    
    setupNavigation();
    setupForms();
}

// Show login prompt (simple wallet connection)
function showLoginPrompt() {
    const walletAddress = prompt('Enter your wallet address (from Ganache):');
    const privateKey = prompt('Enter your private key:');
    
    if (walletAddress && privateKey) {
        userSession.walletAddress = walletAddress;
        userSession.privateKey = privateKey;
        userSession.industryName = 'Industry ' + walletAddress.substring(0, 6) + '...';
        
        localStorage.setItem('walletAddress', walletAddress);
        localStorage.setItem('privateKey', privateKey);
        localStorage.setItem('industryName', userSession.industryName);
        
        location.reload();
    }
}

// Setup navigation
function setupNavigation() {
    const navItems = document.querySelectorAll('.nav-item');
    const sections = document.querySelectorAll('.content-section');
    
    navItems.forEach(item => {
        item.addEventListener('click', (e) => {
            e.preventDefault();
            
            const targetSection = item.dataset.section;
            
            // Update active nav item
            navItems.forEach(nav => nav.classList.remove('active'));
            item.classList.add('active');
            
            // Show target section
            sections.forEach(section => {
                section.classList.remove('active');
                if (section.id === targetSection) {
                    section.classList.add('active');
                }
            });
            
            // Load data for section if needed
            if (targetSection === 'projects') {
                loadProjects();
            } else if (targetSection === 'transactions') {
                loadTransactions();
            }
        });
    });
    
    // Logout button
    document.getElementById('logoutBtn').addEventListener('click', (e) => {
        e.preventDefault();
        localStorage.clear();
        userSession = { walletAddress: '', industryName: '', privateKey: '' };
        location.reload();
    });
}

// Setup form handlers
function setupForms() {
    // Mint Credits Form
    const mintForm = document.getElementById('mintForm');
    if (mintForm) {
        mintForm.addEventListener('submit', handleMintCredits);
        
        // Update total cost when amount changes
        document.getElementById('mintAmount').addEventListener('input', updateMintCost);
    }
    
    // Burn Credits Form
    const burnForm = document.getElementById('burnForm');
    if (burnForm) {
        burnForm.addEventListener('submit', handleBurnCredits);
    }
}

// Update mint cost based on amount
async function updateMintCost() {
    const amount = parseFloat(document.getElementById('mintAmount').value) || 0;
    
    try {
        const response = await fetch(`${API_BASE_URL}/credit-price`);
        const result = await response.json();
        
        if (result.success) {
            const priceInEth = parseFloat(result.data.priceInEth);
            const totalCost = (amount * priceInEth).toFixed(4);
            document.getElementById('creditPrice').textContent = result.data.priceInEth + ' ETH';
            document.getElementById('totalCost').textContent = totalCost + ' ETH';
        }
    } catch (error) {
        console.error('Error fetching credit price:', error);
    }
}

// Handle Mint Credits
async function handleMintCredits(e) {
    e.preventDefault();
    
    const projectId = parseInt(document.getElementById('mintProjectId').value);
    const amount = parseFloat(document.getElementById('mintAmount').value);
    const privateKey = document.getElementById('mintPrivateKey').value;
    
    if (!projectId || !amount || !privateKey) {
        showError('Please fill in all fields');
        return;
    }
    
    try {
        // Call backend to mint credits
        const response = await fetch(`${API_BASE_URL}/verify-final`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                projectId: projectId,
                ownerPrivateKey: privateKey
            })
        });
        
        const result = await response.json();
        
        if (result.success) {
            // Add to transaction history
        const tx = {
                hash: result.data.transactionHash,
                type: 'mint',
                amount: amount,
                status: 'completed',
                date: new Date().toISOString()
            };
            transactionHistory.unshift(tx);
            localStorage.setItem('transactionHistory', JSON.stringify(transactionHistory));
            
            // Show success
            showSuccess('Credits Minted Successfully!', {
                'Transaction Hash': result.data.transactionHash,
                'Block Number': result.data.blockNumber,
                'Project ID': projectId,
                'Amount': amount + ' CCT'
            });
            
            // Refresh data
            await loadDashboardData();
            document.getElementById('mintForm').reset();
        } else {
            showError(result.message || 'Failed to mint credits');
        }
    } catch (error) {
        console.error('Error minting credits:', error);
        showError('Failed to mint credits. Please check your connection and try again.');
    }
}

// Handle Burn Credits
async function handleBurnCredits(e) {
    e.preventDefault();
    
    const amount = parseFloat(document.getElementById('burnAmount').value);
    const privateKey = document.getElementById('burnPrivateKey').value;
    
    if (!amount || !privateKey) {
        showError('Please fill in all fields');
        return;
    }
    
    try {
        // Check balance first
        const balanceResponse = await fetch(`${API_BASE_URL}/token-balance/${userSession.walletAddress}`);
        const balanceResult = await balanceResponse.json();
        
        if (balanceResult.success) {
            const balance = parseFloat(balanceResult.data.balanceInTokens);
            if (amount > balance) {
                showError('Insufficient balance. You have ' + balance + ' CCT');
                return;
            }
        }
        
        // Call backend to burn credits
        const response = await fetch(`${API_BASE_URL}/burn-credits`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                amount: amount,
                privateKey: privateKey
            })
        });
        
        const result = await response.json();
        
        if (result.success) {
            // Add to transaction history
            const tx = {
                hash: result.data.transactionHash,
                type: 'burn',
                amount: amount,
                status: 'completed',
                date: new Date().toISOString()
            };
            transactionHistory.unshift(tx);
            localStorage.setItem('transactionHistory', JSON.stringify(transactionHistory));
            
            // Show success
            showSuccess('Credits Burned Successfully!', {
                'Transaction Hash': result.data.transactionHash,
                'Block Number': result.data.blockNumber,
                'Amount Burned': amount + ' CCT'
            });
            
            // Refresh data
            await loadDashboardData();
            document.getElementById('burnForm').reset();
        } else {
            showError(result.message || 'Failed to burn credits');
        }
    } catch (error) {
        console.error('Error burning credits:', error);
        showError('Failed to burn credits. Please check your connection and try again.');
    }
}

// Load Dashboard Data
async function loadDashboardData() {
    // Update header
    document.getElementById('industryName').textContent = userSession.industryName;
    document.getElementById('walletAddress').textContent = userSession.walletAddress;
    
    try {
        // Get token balance
        const balanceResponse = await fetch(`${API_BASE_URL}/token-balance/${userSession.walletAddress}`);
        const balanceResult = await balanceResponse.json();
        
        if (balanceResult.success) {
            const totalCredits = parseFloat(balanceResult.data.balanceInTokens) || 0;
            document.getElementById('totalCredits').textContent = totalCredits.toFixed(4);
            document.getElementById('burnBalance').textContent = totalCredits.toFixed(4);
        }
        
        // Calculate burned credits
        const burnedCredits = transactionHistory
            .filter(tx => tx.type === 'burn')
            .reduce((sum, tx) => sum + tx.amount, 0);
        document.getElementById('creditsBurned').textContent = burnedCredits.toFixed(4);
        
        // Get available projects count
        const projectsResponse = await fetch(`${API_BASE_URL}/status`);
        const projectsResult = await projectsResponse.json();
        
        // For now, show a placeholder - in real app would query all projects
        document.getElementById('availableProjects').textContent = '0';
        
        // Recent transactions count
        document.getElementById('recentTransactions').textContent = transactionHistory.length;
        
    } catch (error) {
        console.error('Error loading dashboard data:', error);
    }
}

// Load Projects
async function loadProjects() {
    const projectsList = document.getElementById('projectsList');
    projectsList.innerHTML = '<div class="loading-spinner"><i class="fas fa-spinner fa-spin"></i><p>Loading projects...</p></div>';
    
    try {
        // Get all minted projects from events
        const response = await fetch(`${API_BASE_URL}/events/CreditsMinted?fromBlock=0`);
        const result = await response.json();
        
        if (result.success && result.data.count > 0) {
            const projectsHTML = result.data.events.map(event => {
                const projectData = event.returnValues;
                return `
                    <div class="project-card">
                        <div class="project-header">
                            <span class="project-id">#${projectData.projectId}</span>
                            <span class="project-status status-verified">
                                <i class="fas fa-check-circle"></i>
                                Verified
                            </span>
                        </div>
                        <h3 class="project-name">Carbon Project #${projectData.projectId}</h3>
                        <div class="project-details">
                            <div class="detail-item">
                                <i class="fas fa-leaf"></i>
                                <span>Credits Issued: ${parseFloat(projectData.credits / 1e18).toFixed(4)} CCT</span>
                            </div>
                            <div class="detail-item">
                                <i class="fas fa-calendar"></i>
                                <span>Block: ${event.blockNumber}</span>
                            </div>
                        </div>
                        <button class="btn btn-primary" onclick="selectProject(${projectData.projectId})">
                            Select Project
                        </button>
                    </div>
                `;
            }).join('');
            
            projectsList.innerHTML = projectsHTML;
        } else {
            projectsList.innerHTML = `
                <div class="empty-state">
                    <i class="fas fa-project-diagram"></i>
                    <p>No verified projects available yet</p>
                </div>
            `;
        }
    } catch (error) {
        console.error('Error loading projects:', error);
        projectsList.innerHTML = `
            <div class="empty-state">
                <i class="fas fa-exclamation-triangle"></i>
                <p>Error loading projects. Make sure backend is running.</p>
            </div>
        `;
    }
}

// Select Project (navigate to mint section)
function selectProject(projectId) {
    // Fill in the mint form with the project ID
    document.getElementById('mintProjectId').value = projectId;
    
    // Navigate to mint section
    document.querySelector('.nav-item[data-section="mint"]').click();
}

// Load Transactions
function loadTransactions() {
    const transactionsList = document.getElementById('transactionsList');
    
    if (transactionHistory.length === 0) {
        transactionsList.innerHTML = `
            <tr>
                <td colspan="5" class="empty-state">
                    <i class="fas fa-inbox"></i>
                    <p>No transactions yet</p>
                </td>
            </tr>
        `;
        return;
    }
    
    const transactionsHTML = transactionHistory.map(tx => `
        <tr>
            <td class="tx-hash">${tx.hash.substring(0, 18)}...</td>
            <td>
                <span class="tx-type ${tx.type === 'mint' ? 'type-mint' : 'type-burn'}">
                    <i class="fas fa-${tx.type === 'mint' ? 'plus' : 'fire'}"></i>
                    ${tx.type.charAt(0).toUpperCase() + tx.type.slice(1)}
                </span>
            </td>
            <td>${tx.amount} CCT</td>
            <td>
                <span class="tx-status status-completed">
                    <i class="fas fa-check-circle"></i>
                    ${tx.status.charAt(0).toUpperCase() + tx.status.slice(1)}
                </span>
            </td>
            <td>${new Date(tx.date).toLocaleDateString()}</td>
        </tr>
    `).join('');
    
    transactionsList.innerHTML = transactionsHTML;
}

// Show Success Modal
function showSuccess(message, details = {}) {
    const modal = document.getElementById('successModal');
    const detailsContainer = document.getElementById('modalDetails');
    
    document.getElementById('successMessage').textContent = message;
    
    // Add details if provided
    if (Object.keys(details).length > 0) {
        const detailsHTML = Object.entries(details).map(([key, value]) => `
            <div class="detail-row">
                <span class="detail-label">${key}</span>
                <span class="detail-value">${value}</span>
            </div>
        `).join('');
        detailsContainer.innerHTML = detailsHTML;
        detailsContainer.style.display = 'block';
    } else {
        detailsContainer.style.display = 'none';
    }
    
    modal.classList.add('active');
}

// Show Error Modal
function showError(message) {
    const modal = document.getElementById('errorModal');
    document.getElementById('errorMessage').textContent = message;
    modal.classList.add('active');
}

// Close Modals
function closeModal() {
    document.getElementById('successModal').classList.remove('active');
}

function closeErrorModal() {
    document.getElementById('errorModal').classList.remove('active');
}

// Close modal when clicking outside
document.querySelectorAll('.modal').forEach(modal => {
    modal.addEventListener('click', (e) => {
        if (e.target === modal) {
            modal.classList.remove('active');
        }
    });
});

