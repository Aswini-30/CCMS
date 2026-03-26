// Project Routes
// This file defines all the routes related to projects

const express = require('express');
const router = express.Router();

// Import controller functions
const { createProject, getProjects, getProjectById, updateProject, deleteProject, getPendingProjects, approveProject, rejectProject, getPendingCount } = require('../controllers/projectController');

/**
 * POST /api/projects
 * Create a new project
 */
router.post('/', createProject);

/**
 * GET /api/projects/pending
 * Get all pending projects for Panchayat verification
 */
router.get('/pending', getPendingProjects);

/**
 * GET /api/projects/pending/count
 * Get count of pending projects
 */
router.get('/pending/count', getPendingCount);

/**
 * GET /api/projects/:walletAddress
 * Get all projects for a wallet address
 */
router.get('/:walletAddress', getProjects);

/**
 * GET /api/projects/project/:id
 * Get a single project by ID
 */
router.get('/project/:id', getProjectById);

/**
 * PUT /api/projects/:id
 * Update a project
 */
router.put('/:id', updateProject);

/**
 * PUT /api/projects/:id/approve
 * Approve a project
 */
router.put('/:id/approve', approveProject);

/**
 * PUT /api/projects/:id/reject
 * Reject a project
 */
router.put('/:id/reject', rejectProject);

/**
 * DELETE /api/projects/:id
 * Delete a project
 */
router.delete('/:id', deleteProject);

// Export the router
module.exports = router;
