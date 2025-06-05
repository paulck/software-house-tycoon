const express = require('express');
const GameController = require('../controllers/gameController');
const ProjectController = require('../controllers/projectController');
const HRController = require('../controllers/hrController'); 
const SalesController = require('../controllers/salesController');
const router = express.Router();

// Games routes
router.get('/games', GameController.getAllGames);
router.post('/games', GameController.createGame);
router.get('/games/:id', GameController.getGame);
router.put('/games/:id', GameController.updateGame);
router.delete('/games/:id', GameController.deleteGame);
router.post('/games/:id/autosave', GameController.autoSave);

// Projects routes
router.get('/games/:id/projects', ProjectController.getProjects);
router.post('/games/:id/projects/assign', ProjectController.assignProject);

module.exports = router;
// HR routes
router.get('/hr/market', HRController.getMarketResources);
router.post('/games/:id/hr/hire', HRController.hireResource);
// Sales routes
router.get('/games/:id/sales', SalesController.getSales);
router.post('/games/:id/sales/:salesId/generate-project', SalesController.generateProject);
