const { statements } = require('../models/database');
const { calculateMonthlyCosts } = require('../services/calculationService');

class GameController {
  // Create new game
  static createGame = (req, res) => {
    try {
      console.log('🎮 Creating new game...');
      
      // Create new game with initial values
      const gameResult = statements.createGame.run(5000, 0);
      console.log('✅ Game created:', gameResult);
      
      // FIXED: Access the game ID correctly from the result
      const gameId = gameResult.id || gameResult.lastInsertRowid;
      
      if (!gameId) {
        throw new Error('Failed to get game ID from creation result');
      }
      
      console.log(`✅ Game ID: ${gameId}`);
      
      // Add initial developer
      console.log('👨‍💻 Adding initial developer...');
      const devResult = statements.createDeveloper.run(gameId, 'Marco Rossi', 3, 1500);
      console.log('✅ Developer added:', devResult);
      
      // Add initial sales person
      console.log('💼 Adding initial sales person...');
      const salesResult = statements.createSalesPerson.run(gameId, 'Laura Bianchi', 2, 1100);
      console.log('✅ Sales person added:', salesResult);
      
      // Update monthly costs
      console.log('💰 Calculating monthly costs...');
      const monthlyCosts = calculateMonthlyCosts(gameId);
      console.log(`💰 Monthly costs: ${monthlyCosts}`);
      
      statements.updateGame.run(5000, monthlyCosts, gameId);
      console.log('✅ Game updated with monthly costs');
      
      // Return full game state
      const fullGameState = GameController.getFullGameState(gameId);
      
      if (!fullGameState) {
        throw new Error('Failed to retrieve full game state');
      }
      
      console.log('🎉 Game creation completed successfully');
      
      res.status(201).json({
        success: true,
        data: fullGameState
      });
    } catch (error) {
      console.error('❌ Error creating game:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to create game: ' + error.message
      });
    }
  };

  // Get all games
  static getAllGames = (req, res) => {
    try {
      const games = statements.getAllGames.all();
      
      res.json({
        success: true,
        data: games
      });
    } catch (error) {
      console.error('Error getting games:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to get games'
      });
    }
  };

  // Get single game with full state
  static getGame = (req, res) => {
    try {
      const { id } = req.params;
      const gameState = GameController.getFullGameState(parseInt(id));
      
      if (!gameState) {
        return res.status(404).json({
          success: false,
          error: 'Game not found'
        });
      }
      
      res.json({
        success: true,
        data: gameState
      });
    } catch (error) {
      console.error('Error getting game:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to get game'
      });
    }
  };

  // Update game state - FIXED: handle monthly_costs properly
  static updateGame = (req, res) => {
    try {
      const { id } = req.params;
      const { patrimonio, monthly_costs, current_month } = req.body;
      
      // Use provided monthly_costs or calculate them
      const finalMonthlyCosts = monthly_costs !== undefined ? monthly_costs : calculateMonthlyCosts(parseInt(id));
      
      statements.updateGame.run(patrimonio, finalMonthlyCosts, parseInt(id));
      
      const updatedGame = statements.getGame.get(parseInt(id));
      
      res.json({
        success: true,
        data: updatedGame
      });
    } catch (error) {
      console.error('Error updating game:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to update game'
      });
    }
  };

  // Delete game
  static deleteGame = (req, res) => {
    try {
      const { id } = req.params;
      
      const result = statements.deleteGame.run(parseInt(id));
      
      if (result.changes === 0) {
        return res.status(404).json({
          success: false,
          error: 'Game not found'
        });
      }
      
      res.json({
        success: true,
        message: 'Game deleted successfully'
      });
    } catch (error) {
      console.error('Error deleting game:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to delete game'
      });
    }
  };

  // Get full game state (helper method) - FIXED: consistent field naming
  static getFullGameState = (gameId) => {
    try {
      const game = statements.getGame.get(gameId);
      if (!game) return null;
      
      const developers = statements.getDevelopersByGame.all(gameId);
      const salesPeople = statements.getSalesPeopleByGame.all(gameId);
      const projects = statements.getProjectsByGame.all(gameId);
      
      return {
        ...game,
        developers,
        sales: salesPeople, // FIXED: Map salesPeople to sales for frontend compatibility
        projects
      };
    } catch (error) {
      console.error('Error getting full game state:', error);
      return null;
    }
  };

  // Auto-save game state
  static autoSave = (req, res) => {
    try {
      const { id } = req.params;
      const gameState = req.body;
      
      // Calculate current monthly costs if not provided
      const monthlyCosts = gameState.monthly_costs || calculateMonthlyCosts(parseInt(id));
      
      // Update game basic info
      statements.updateGame.run(
        gameState.patrimonio, 
        monthlyCosts, 
        parseInt(id)
      );
      
      res.json({
        success: true,
        message: 'Game auto-saved successfully'
      });
    } catch (error) {
      console.error('Error auto-saving game:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to auto-save game'
      });
    }
  };
}

module.exports = GameController;
