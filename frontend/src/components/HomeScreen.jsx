import React, { useState, useEffect } from 'react';
import { gameApi } from '../services/api';

const HomeScreen = ({ onNewGame, onLoadGame, error, loading }) => {
  const [savedGames, setSavedGames] = useState([]);
  const [loadingGames, setLoadingGames] = useState(false);

  useEffect(() => {
    loadSavedGames();
  }, []);

  const loadSavedGames = async () => {
    try {
      setLoadingGames(true);
      const response = await gameApi.getGames();
      setSavedGames(response.data.data || []);
    } catch (error) {
      console.error('Failed to load saved games:', error);
    } finally {
      setLoadingGames(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-600 to-blue-600 flex items-center justify-center p-4">
      <div className="bg-white bg-opacity-95 backdrop-blur-lg rounded-3xl p-12 max-w-lg w-full text-center shadow-2xl">
        <div className="mb-12">
          <div className="text-6xl mb-6">🏢</div>
          <h1 className="text-4xl font-bold text-gray-800 mb-4">Software House Tycoon</h1>
          <p className="text-lg text-gray-600 leading-relaxed">Gestisci la tua azienda tech e evita la bancarotta!</p>
        </div>
        
        {error && (
          <div className="mb-6 p-4 bg-red-100 border border-red-400 text-red-700 rounded-lg">
            {error}
          </div>
        )}
        
        <div className="space-y-6">
          <button 
            onClick={onNewGame}
            disabled={loading}
            className="w-full bg-gradient-to-r from-purple-600 to-blue-600 text-white font-semibold py-4 px-8 rounded-xl text-lg transition-all hover:transform hover:scale-105 disabled:opacity-50"
          >
            {loading ? '⏳ Creando...' : '🚀 Nuova Partita'}
          </button>
          
          {savedGames.length > 0 && (
            <div className="space-y-3">
              <h3 className="text-lg font-semibold text-gray-700">Partite Salvate</h3>
              {loadingGames ? (
                <div className="animate-pulse bg-gray-200 h-12 rounded-lg"></div>
              ) : (
                savedGames.slice(0, 3).map(game => (
                  <button
                    key={game.id}
                    onClick={() => onLoadGame(game.id)}
                    className="w-full bg-gray-100 hover:bg-gray-200 font-medium py-3 px-6 rounded-lg transition-colors text-left"
                  >
                    <div className="flex justify-between items-center">
                      <span>Partita #{game.id}</span>
                      <span className="text-sm text-gray-600">€{game.patrimonio?.toLocaleString()}</span>
                    </div>
                  </button>
                ))
              )}
            </div>
          )}
        </div>
        
        <div className="mt-12 text-sm text-gray-500 space-y-3">
          <p className="text-base font-medium text-gray-700"><strong>Obiettivo:</strong> Far crescere l'azienda bilanciando talenti e risorse</p>
          <div className="bg-gray-50 rounded-lg p-4 mt-4">
            <p className="font-medium text-gray-700 mb-2">Condizioni iniziali:</p>
            <div className="flex justify-center space-x-6 text-sm">
              <span>👨‍💻 1 Developer</span>
              <span>🎯 1 Commerciale</span>
              <span>💰 5.000€</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default HomeScreen;
