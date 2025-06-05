import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Layout from './components/Layout';
import HomeScreen from './components/HomeScreen';
import ProductionScreen from './components/ProductionScreen';
import SalesScreen from './components/SalesScreen';
import HRScreen from './components/HRScreen';
import { gameApi } from './services/api';
import './App.css';

function App() {
  const [currentGame, setCurrentGame] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Auto-save game state every 30 seconds
  useEffect(() => {
    if (!currentGame) return;

    const autoSaveInterval = setInterval(async () => {
      try {
        await gameApi.autoSave(currentGame.id, currentGame);
        console.log('✅ Game auto-saved');
      } catch (error) {
        console.error('❌ Auto-save failed:', error);
      }
    }, 30000);

    return () => clearInterval(autoSaveInterval);
  }, [currentGame]);

  // Start new game
  const startNewGame = async () => {
    try {
      setLoading(true);
      setError(null);
      
      console.log('🎮 Creating new game...');
      const response = await gameApi.createGame();
      console.log('📥 Response:', response.data);
      
      const newGame = response.data.data;
      setCurrentGame(newGame);
      
      console.log('🎮 New game started:', newGame.id);
    } catch (error) {
      console.error('❌ Failed to create game:', error);
      setError('Errore nella creazione del gioco: ' + (error.response?.data?.error || error.message));
    } finally {
      setLoading(false);
    }
  };

  // Load existing game
  const loadGame = async (gameId) => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await gameApi.getGame(gameId);
      const game = response.data.data;
      
      setCurrentGame(game);
      console.log('📂 Game loaded:', gameId);
    } catch (error) {
      console.error('❌ Failed to load game:', error);
      setError('Errore nel caricamento del gioco');
    } finally {
      setLoading(false);
    }
  };

  // Exit current game
  const exitGame = () => {
    setCurrentGame(null);
    setError(null);
  };

  // Update game state
  const updateGameState = (updates) => {
    setCurrentGame(prev => prev ? { ...prev, ...updates } : null);
  };

  // Refresh game data from server
  const refreshGame = async () => {
    if (!currentGame) return;
    
    try {
      const response = await gameApi.getGame(currentGame.id);
      setCurrentGame(response.data.data);
    } catch (error) {
      console.error('❌ Failed to refresh game:', error);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-600 to-blue-600 flex items-center justify-center">
        <div className="text-center text-white">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-white mx-auto mb-4"></div>
          <p className="text-xl">
            {currentGame ? 'Caricamento...' : 'Creando nuova partita...'}
          </p>
        </div>
      </div>
    );
  }

  return (
    <Router>
      <div className="App">
        {!currentGame ? (
          <HomeScreen 
            onNewGame={startNewGame}
            onLoadGame={loadGame}
            error={error}
            loading={loading}
          />
        ) : (
          <Layout 
            game={currentGame} 
            onExit={exitGame}
            onUpdateGame={updateGameState}
          >
            <Routes>
              <Route path="/" element={<Navigate to="/production" replace />} />
              <Route 
                path="/production" 
                element={
                  <ProductionScreen 
                    game={currentGame}
                    onUpdateGame={updateGameState}
                    onRefresh={refreshGame}
                  />
                } 
              />
              <Route 
                path="/sales" 
                element={
                  <SalesScreen 
                    game={currentGame}
                    onUpdateGame={updateGameState}
                    onRefresh={refreshGame}
                  />
                } 
              />
              <Route 
                path="/hr" 
                element={
                  <HRScreen 
                    game={currentGame}
                    onUpdateGame={updateGameState}
                    onRefresh={refreshGame}
                  />
                } 
              />
            </Routes>
          </Layout>
        )}
      </div>
    </Router>
  );
}

export default App;
