const { statements, db } = require('../models/database');
const ProjectController = require('./projectController');

class SalesController {
  // Get sales people for a game
  static getSales = (req, res) => {
    try {
      const { id } = req.params;
      const sales = statements.getSalesPeopleByGame.all(parseInt(id));
      
      res.json({
        success: true,
        data: sales
      });
    } catch (error) {
      console.error('Error getting sales:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to get sales'
      });
    }
  };

  // Generate project with sales person
  static generateProject = (req, res) => {
    try {
      const { id: gameId, salesId } = req.params;
      
      console.log(`🎯 Generating project with sales ID ${salesId} for game ${gameId}`);
      
      // Get the sales person
      const salesPerson = db.prepare('SELECT * FROM sales_people WHERE id = ? AND game_id = ?').get(parseInt(salesId), parseInt(gameId));
      
      if (!salesPerson) {
        return res.status(404).json({
          success: false,
          error: 'Sales person not found'
        });
      }
      
      if (salesPerson.status !== 'available') {
        return res.status(400).json({
          success: false,
          error: 'Sales person is not available'
        });
      }
      
      // Calculate generation time (higher experience = faster generation)
      const baseTime = 30; // 30 seconds base
      const generationTime = Math.max(10, baseTime - (salesPerson.experience * 4)); // 10-26 seconds
      const generationEndTime = new Date(Date.now() + generationTime * 1000);
      
      // Mark sales person as generating
      statements.updateSalesPerson.run('generating', generationEndTime.toISOString(), parseInt(salesId));
      
      console.log(`⏰ Project generation will complete in ${generationTime} seconds`);
      
      // Auto-complete project generation after timeout
      setTimeout(() => {
        try {
          // Generate project parameters
          const projectNames = [
            'E-commerce Platform', 'Mobile App Development', 'CRM System', 'Website Redesign',
            'API Integration', 'Database Migration', 'Dashboard Analytics', 'ERP System',
            'Social Media Platform', 'Booking System', 'Inventory Management', 'Payment Gateway'
          ];
          
          const name = projectNames[Math.floor(Math.random() * projectNames.length)];
          const complexity = Math.floor(Math.random() * 5) + 1; // 1-5
          
          // Value based on sales person experience with some randomness
          const baseValue = salesPerson.experience * 800;
          const randomMultiplier = 0.8 + (Math.random() * 0.8); // 0.8 to 1.6
          const value = Math.floor(baseValue * randomMultiplier * complexity);
          
          // Create the project
          const projectResult = statements.createProject.run(parseInt(gameId), name, complexity, value);
          
          console.log(`✅ Project "${name}" generated with value €${value} (complexity ${complexity}/5)`);
          
          // Mark sales person as available again
          statements.updateSalesPerson.run('available', null, parseInt(salesId));
          
        } catch (error) {
          console.error('❌ Error completing project generation:', error);
          
          // Fallback: mark sales person as available even if project creation failed
          try {
            statements.updateSalesPerson.run('available', null, parseInt(salesId));
          } catch (fallbackError) {
            console.error('❌ Failed to reset sales person status:', fallbackError);
          }
        }
      }, generationTime * 1000);
      
      res.json({
        success: true,
        message: 'Project generation started',
        data: {
          salesId: parseInt(salesId),
          generationTime,
          estimatedCompletion: generationEndTime.toISOString()
        }
      });
      
    } catch (error) {
      console.error('❌ Error generating project:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to generate project: ' + error.message
      });
    }
  };
}

module.exports = SalesController;