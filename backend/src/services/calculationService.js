const { statements } = require('../models/database');

class CalculationService {
  // Calculate monthly costs for a game
  static calculateMonthlyCosts = (gameId) => {
    try {
      const developers = statements.getDevelopersByGame.all(gameId);
      const salesPeople = statements.getSalesPeopleByGame.all(gameId);
      
      const developerCosts = developers.reduce((sum, dev) => sum + dev.salary, 0);
      const salesCosts = salesPeople.reduce((sum, sales) => sum + sales.salary, 0);
      
      return developerCosts + salesCosts;
    } catch (error) {
      console.error('Error calculating monthly costs:', error);
      return 0;
    }
  };
}

// Export individual functions for backwards compatibility
const calculateMonthlyCosts = CalculationService.calculateMonthlyCosts;

module.exports = {
  CalculationService,
  calculateMonthlyCosts
};
