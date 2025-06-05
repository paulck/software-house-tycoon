const { statements, db } = require('../models/database'); // ← AGGIUNTO db import
const { calculateMonthlyCosts } = require('../services/calculationService');

class HRController {
  // Get market resources
  static getMarketResources = (req, res) => {
    try {
      const { type } = req.query;
      
      let query = 'SELECT * FROM market_resources WHERE is_hired = false';
      let params = [];
      
      if (type && (type === 'developer' || type === 'sales')) {
        query += ' AND type = ?';
        params.push(type);
      }
      
      query += ' ORDER BY skill_level DESC, hiring_cost ASC';
      
      // FIXED: Usa db direttamente invece di statements.db
      const resources = db.prepare(query).all(...params);
      
      res.json({
        success: true,
        data: resources
      });
    } catch (error) {
      console.error('Error getting market resources:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to get market resources'
      });
    }
  };

  // Hire a resource
  static hireResource = (req, res) => {
    try {
      const { id: gameId } = req.params;
      const { resourceId, resourceType } = req.body;
      
      console.log(`💼 Hiring ${resourceType} ID ${resourceId} for game ${gameId}`);
      
      // FIXED: Usa db direttamente
      const resource = db.prepare('SELECT * FROM market_resources WHERE id = ? AND is_hired = false').get(resourceId);
      
      if (!resource) {
        return res.status(404).json({
          success: false,
          error: 'Resource not found or already hired'
        });
      }
      
      if (resource.type !== resourceType) {
        return res.status(400).json({
          success: false,
          error: 'Resource type mismatch'
        });
      }
      
      // Check if game has enough money
      const game = statements.getGame.get(parseInt(gameId));
      if (!game) {
        return res.status(404).json({
          success: false,
          error: 'Game not found'
        });
      }
      
      if (game.patrimonio < resource.hiring_cost) {
        return res.status(400).json({
          success: false,
          error: 'Insufficient funds'
        });
      }
      
      // Hire the resource based on type
      if (resourceType === 'developer') {
        statements.createDeveloper.run(
          parseInt(gameId),
          resource.name,
          resource.skill_level, // seniority
          resource.monthly_salary
        );
      } else if (resourceType === 'sales') {
        statements.createSalesPerson.run(
          parseInt(gameId),
          resource.name,
          resource.skill_level, // experience
          resource.monthly_salary
        );
      }
      
      // Mark resource as hired
      statements.markResourceHired.run(resourceId);
      
      // Update game patrimonio (subtract hiring cost)
      const newPatrimonio = game.patrimonio - resource.hiring_cost;
      
      // Recalculate monthly costs
      const newMonthlyCosts = calculateMonthlyCosts(parseInt(gameId));
      
      // Update game
      statements.updateGame.run(newPatrimonio, newMonthlyCosts, parseInt(gameId));
      
      console.log(`✅ ${resourceType} hired successfully for game ${gameId}`);
      
      res.json({
        success: true,
        message: `${resourceType === 'developer' ? 'Developer' : 'Sales person'} hired successfully`,
        data: {
          resourceId,
          resourceType,
          hiringCost: resource.hiring_cost,
          newPatrimonio,
          newMonthlyCosts
        }
      });
      
    } catch (error) {
      console.error('Error hiring resource:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to hire resource: ' + error.message
      });
    }
  };
}

module.exports = HRController;