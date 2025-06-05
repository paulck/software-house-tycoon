const Database = require('better-sqlite3');
const path = require('path');
const fs = require('fs');

const DB_PATH = process.env.DB_PATH || path.join(__dirname, '../../data/game.db');

// Ensure data directory exists
const dataDir = path.dirname(DB_PATH);
if (!fs.existsSync(dataDir)) {
  fs.mkdirSync(dataDir, { recursive: true });
}

// Initialize database connection
const db = new Database(DB_PATH);
db.pragma('foreign_keys = ON');

const initializeDatabase = () => {
  try {
    console.log('🗄️ Initializing database...');
    
    // Create tables
    db.exec(`
      CREATE TABLE IF NOT EXISTS games (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        patrimonio REAL DEFAULT 5000.0,
        monthly_costs REAL DEFAULT 0.0,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        is_active BOOLEAN DEFAULT true
      );

      CREATE TABLE IF NOT EXISTS developers (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        game_id INTEGER NOT NULL,
        name TEXT NOT NULL,
        seniority INTEGER CHECK(seniority BETWEEN 1 AND 5) NOT NULL,
        salary REAL NOT NULL,
        status TEXT CHECK(status IN ('available', 'busy')) DEFAULT 'available',
        current_project_id INTEGER NULL,
        hired_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (game_id) REFERENCES games(id) ON DELETE CASCADE
      );

      CREATE TABLE IF NOT EXISTS sales_people (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        game_id INTEGER NOT NULL,
        name TEXT NOT NULL,
        experience INTEGER CHECK(experience BETWEEN 1 AND 5) NOT NULL,
        salary REAL NOT NULL,
        status TEXT CHECK(status IN ('available', 'generating')) DEFAULT 'available',
        generation_end DATETIME NULL,
        hired_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (game_id) REFERENCES games(id) ON DELETE CASCADE
      );

      CREATE TABLE IF NOT EXISTS projects (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        game_id INTEGER NOT NULL,
        name TEXT NOT NULL,
        complexity INTEGER CHECK(complexity BETWEEN 1 AND 5) NOT NULL,
        value REAL NOT NULL,
        status TEXT CHECK(status IN ('pending', 'in_progress', 'completed')) DEFAULT 'pending',
        assigned_developer_id INTEGER NULL,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        started_at DATETIME NULL,
        completed_at DATETIME NULL,
        completion_time INTEGER NULL,
        FOREIGN KEY (game_id) REFERENCES games(id) ON DELETE CASCADE,
        FOREIGN KEY (assigned_developer_id) REFERENCES developers(id)
      );

      CREATE TABLE IF NOT EXISTS market_resources (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        type TEXT CHECK(type IN ('developer', 'sales')) NOT NULL,
        name TEXT NOT NULL,
        skill_level INTEGER CHECK(skill_level BETWEEN 1 AND 5) NOT NULL,
        hiring_cost REAL NOT NULL,
        monthly_salary REAL NOT NULL,
        is_hired BOOLEAN DEFAULT false,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP
      );

      CREATE INDEX IF NOT EXISTS idx_developers_game_id ON developers(game_id);
      CREATE INDEX IF NOT EXISTS idx_sales_people_game_id ON sales_people(game_id);
      CREATE INDEX IF NOT EXISTS idx_projects_game_id ON projects(game_id);
      CREATE INDEX IF NOT EXISTS idx_projects_status ON projects(status);
    `);

    console.log('✅ Database tables created');

    // Seed market resources if table is empty
    const marketCount = db.prepare('SELECT COUNT(*) as count FROM market_resources').get();
    if (marketCount.count === 0) {
      seedMarketResources();
    }

    console.log('✅ Database initialized successfully');
  } catch (error) {
    console.error('❌ Database initialization failed:', error);
    throw error;
  }
};

const seedMarketResources = () => {
  console.log('🌱 Seeding market resources...');
  
  const devNames = ['Andrea Silva', 'Giulia Ferrari', 'Luca Romano', 'Sofia Greco', 'Matteo Bruno'];
  const salesNames = ['Francesco Ricci', 'Valentina Marino', 'Davide Costa', 'Sara Fontana', 'Alessandro Galli'];
  
  const insertResource = db.prepare(`
    INSERT INTO market_resources (type, name, skill_level, hiring_cost, monthly_salary)
    VALUES (?, ?, ?, ?, ?)
  `);

  // Add developers
  devNames.forEach(name => {
    const skillLevel = Math.floor(Math.random() * 5) + 1;
    const hiringCost = skillLevel * 1000 + Math.floor(Math.random() * 500);
    const monthlySalary = skillLevel * 800 + Math.floor(Math.random() * 400);
    
    insertResource.run('developer', name, skillLevel, hiringCost, monthlySalary);
  });

  // Add sales people
  salesNames.forEach(name => {
    const skillLevel = Math.floor(Math.random() * 5) + 1;
    const hiringCost = skillLevel * 800 + Math.floor(Math.random() * 400);
    const monthlySalary = skillLevel * 700 + Math.floor(Math.random() * 300);
    
    insertResource.run('sales', name, skillLevel, hiringCost, monthlySalary);
  });

  console.log('✅ Market resources seeded');
};

// Create statements object that will be populated after initialization
const statements = {};

// Function to initialize statements AFTER tables are created
const initializeStatements = () => {
  try {
    statements.createGame = db.prepare(`INSERT INTO games (patrimonio, monthly_costs) VALUES (?, ?) RETURNING *`);
    statements.getGame = db.prepare('SELECT * FROM games WHERE id = ?');
    statements.updateGame = db.prepare(`UPDATE games SET patrimonio = ?, monthly_costs = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?`);
    statements.deleteGame = db.prepare('DELETE FROM games WHERE id = ?');
    statements.getAllGames = db.prepare('SELECT * FROM games ORDER BY updated_at DESC');
    
    statements.createDeveloper = db.prepare(`INSERT INTO developers (game_id, name, seniority, salary) VALUES (?, ?, ?, ?) RETURNING *`);
    statements.getDevelopersByGame = db.prepare('SELECT * FROM developers WHERE game_id = ?');
    statements.updateDeveloper = db.prepare(`UPDATE developers SET status = ?, current_project_id = ? WHERE id = ?`);
    
    statements.createSalesPerson = db.prepare(`INSERT INTO sales_people (game_id, name, experience, salary) VALUES (?, ?, ?, ?) RETURNING *`);
    statements.getSalesPeopleByGame = db.prepare('SELECT * FROM sales_people WHERE game_id = ?');
    statements.updateSalesPerson = db.prepare(`UPDATE sales_people SET status = ?, generation_end = ? WHERE id = ?`);
    
    statements.createProject = db.prepare(`INSERT INTO projects (game_id, name, complexity, value) VALUES (?, ?, ?, ?) RETURNING *`);
    statements.getProjectsByGame = db.prepare('SELECT * FROM projects WHERE game_id = ? ORDER BY created_at DESC');
    statements.updateProject = db.prepare(`UPDATE projects SET status = ?, assigned_developer_id = ?, started_at = ?, completed_at = ?, completion_time = ? WHERE id = ?`);
    
    statements.getMarketResources = db.prepare('SELECT * FROM market_resources WHERE is_hired = false');
    statements.markResourceHired = db.prepare('UPDATE market_resources SET is_hired = true WHERE id = ?');

    console.log('✅ Prepared statements initialized');
  } catch (error) {
    console.error('❌ Failed to initialize statements:', error);
    throw error;
  }
};

// Main initialization function that calls both
const initializeDatabaseAndStatements = () => {
  initializeDatabase();
  initializeStatements();
};

module.exports = {
  db,
  initializeDatabase: initializeDatabaseAndStatements,
  statements
};
