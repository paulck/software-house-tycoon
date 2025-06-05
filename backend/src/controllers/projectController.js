const { statements, db } = require('../models/database');
const { calculateMonthlyCosts } = require('../services/calculationService');

class ProjectController {
  // Get all projects for a game
  static getProjects = (req, res) => {
    try {
      const { id } = req.params;
      const projects = statements.getProjectsByGame.all(parseInt(id));
      
      res.json({
        success: true,
        data: projects
      });
    } catch (error) {
      console.error('Error getting projects:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to get projects'
      });
    }
  };

  // Assign project to developer
  static assignProject = (req, res) => {
    try {
      const { id } = req.params;
      const { projectId, developerId } = req.body;
      
      console.log(`🎯 Assigning project ${projectId} to developer ${developerId} for game ${id}`);
      
      // FIXED: Usa db direttamente invece di statements.db
      const project = db.prepare('SELECT * FROM projects WHERE id = ? AND game_id = ?').get(projectId, parseInt(id));
      const developer = db.prepare('SELECT * FROM developers WHERE id = ? AND game_id = ?').get(developerId, parseInt(id));
      
      if (!project) {
        return res.status(404).json({
          success: false,
          error: 'Project not found'
        });
      }
      
      if (!developer) {
        return res.status(404).json({
          success: false,
          error: 'Developer not found'
        });
      }
      
      if (developer.status !== 'available') {
        return res.status(400).json({
          success: false,
          error: 'Developer is not available'
        });
      }
      
      if (project.status !== 'pending') {
        return res.status(400).json({
          success: false,
          error: 'Project is not available for assignment'
        });
      }
      
      // Calculate completion time (complexity * 10 / seniority) seconds
      const completionTime = Math.round((project.complexity * 10) / developer.seniority);
      const startedAt = new Date().toISOString();
      
      console.log(`⏰ Project will complete in ${completionTime} seconds`);
      
      // Update project
      statements.updateProject.run(
        'in_progress',
        developerId,
        startedAt,
        null, // completed_at
        completionTime,
        projectId
      );
      
      // Update developer
      statements.updateDeveloper.run('busy', projectId, developerId);
      
      console.log('✅ Project and developer updated successfully');
      
      // Auto-complete project after timeout
      setTimeout(() => {
        try {
          console.log(`🏁 Completing project "${project.name}"`);
          
          // Update project to completed
          statements.updateProject.run(
            'completed',
            developerId,
            startedAt,
            new Date().toISOString(),
            completionTime,
            projectId
          );
          
          // Update developer back to available
          statements.updateDeveloper.run('available', null, developerId);
          
          // Update game patrimonio
          const game = statements.getGame.get(parseInt(id));
          if (game) {
            const newPatrimonio = game.patrimonio + project.value;
            
            // Recalculate monthly costs (in case they changed)
            const newMonthlyCosts = calculateMonthlyCosts(parseInt(id));
            
            statements.updateGame.run(newPatrimonio, newMonthlyCosts, parseInt(id));
            
            console.log(`💰 Game patrimonio updated: €${newPatrimonio.toLocaleString()}`);
          }
          
          console.log(`✅ Project "${project.name}" completed for €${project.value.toLocaleString()}`);
        } catch (error) {
          console.error('❌ Error completing project:', error);
          
          // Fallback: at least free the developer if project completion fails
          try {
            statements.updateDeveloper.run('available', null, developerId);
            console.log('🔄 Developer freed as fallback');
          } catch (fallbackError) {
            console.error('❌ Failed to free developer in fallback:', fallbackError);
          }
        }
      }, completionTime * 1000);
      
      res.json({
        success: true,
        message: 'Project assigned successfully',
        data: {
          projectId,
          developerId,
          completionTime,
          startedAt,
          estimatedCompletion: new Date(Date.now() + completionTime * 1000).toISOString()
        }
      });
    } catch (error) {
      console.error('❌ Error assigning project:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to assign project: ' + error.message
      });
    }
  };

  // Create new project (used by sales generation)
  static createProject = (gameId, name, complexity, value) => {
    try {
      console.log(`📋 Creating project "${name}" for game ${gameId}`);
      return statements.createProject.run(gameId, name, complexity, value);
    } catch (error) {
      console.error('❌ Error creating project:', error);
      throw error;
    }
  };
}

module.exports = ProjectController;