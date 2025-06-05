import React, { useState, useEffect } from 'react';
import { salesApi } from '../services/api';
import { Briefcase, Target, Clock, DollarSign, TrendingUp, AlertCircle, CheckCircle2, Play } from 'lucide-react';

const SalesScreen = ({ game, onUpdateGame, onRefresh }) => {
  const [loading, setLoading] = useState(false);
  const [generating, setGenerating] = useState(null);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const [generationProgress, setGenerationProgress] = useState({});

  // Auto-refresh to check for completed project generation
  useEffect(() => {
    // ADATTATO: usa game.sales invece di game.salesPeople per compatibilità
    const generatingSales = game?.sales?.filter(s => s.status === 'generating') || [];
    
    if (generatingSales.length > 0) {
      const interval = setInterval(() => {
        onRefresh();
      }, 2000); // Check every 2 seconds

      return () => clearInterval(interval);
    }
  }, [game?.sales, onRefresh]);

  const handleGenerateProject = async (salesId) => {
    try {
      setGenerating(salesId);
      setError(null);
      setSuccess(null);
      
      console.log(`🎯 Generating project with sales ID ${salesId}`);
      
      await salesApi.generateProject(game.id, salesId);
      
      setSuccess('🎉 Commerciale sta generando un nuovo progetto!');
      
      // Start progress simulation
      simulateProgress(salesId);
      
      // Refresh game data
      setTimeout(() => {
        onRefresh();
      }, 500);
      
    } catch (error) {
      console.error('Failed to generate project:', error);
      setError(`Errore nella generazione del progetto: ${error.response?.data?.error || error.message}`);
    } finally {
      setGenerating(null);
      
      // Clear messages after 3 seconds
      setTimeout(() => {
        setSuccess(null);
        setError(null);
      }, 3000);
    }
  };

  const simulateProgress = (salesId) => {
    setGenerationProgress(prev => ({ ...prev, [salesId]: 0 }));
    
    const interval = setInterval(() => {
      setGenerationProgress(prev => {
        const currentProgress = prev[salesId] || 0;
        const newProgress = Math.min(currentProgress + 5, 100);
        
        if (newProgress >= 100) {
          clearInterval(interval);
          // Remove from progress tracking after completion
          setTimeout(() => {
            setGenerationProgress(prev => {
              const updated = { ...prev };
              delete updated[salesId];
              return updated;
            });
          }, 1000);
        }
        
        return { ...prev, [salesId]: newProgress };
      });
    }, 1000); // Update every second
  };

  const getProjectGenerationTime = (experience) => {
    // Higher experience = faster generation (10-26 seconds)
    return Math.max(10, 30 - (experience * 4));
  };

  const getExpectedProjectValue = (experience) => {
    // Rough estimate based on experience
    const baseValue = experience * 800;
    const minValue = baseValue * 0.8;
    const maxValue = baseValue * 1.6;
    return { min: minValue, max: maxValue };
  };

  const renderStars = (level) => {
    return Array.from({ length: 5 }, (_, i) => (
      <span key={i} className={`text-lg ${i < level ? 'text-yellow-400' : 'text-gray-300'}`}>
        ⭐
      </span>
    ));
  };

  const SalesPersonCard = ({ salesPerson }) => {
    const isGenerating = salesPerson.status === 'generating';
    const progress = generationProgress[salesPerson.id] || 0;
    const canGenerate = salesPerson.status === 'available';
    const expectedValue = getExpectedProjectValue(salesPerson.experience);
    const generationTime = getProjectGenerationTime(salesPerson.experience);

    return (
      <div className={`p-6 rounded-xl border-2 transition-all duration-300 ${
        isGenerating 
          ? 'bg-gradient-to-r from-orange-50 to-yellow-50 border-orange-300 shadow-lg' 
          : canGenerate
          ? 'bg-gradient-to-r from-green-50 to-emerald-50 border-green-300 hover:shadow-lg hover:border-green-400'
          : 'bg-gray-50 border-gray-300'
      }`}>
        <div className="flex items-start justify-between mb-4">
          <div>
            <h4 className="text-xl font-semibold text-gray-800 mb-2">{salesPerson.name}</h4>
            <div className="flex items-center space-x-2 mb-3">
              <span className="text-sm text-gray-600">Esperienza:</span>
              <div className="flex">{renderStars(salesPerson.experience)}</div>
              <span className="text-sm font-medium text-gray-700">({salesPerson.experience}/5)</span>
            </div>
          </div>
          <div className="text-right">
            <div className="bg-white bg-opacity-80 rounded-lg p-3">
              <div className="text-sm text-gray-600">Stipendio</div>
              <div className="font-semibold text-red-600">€{salesPerson.salary?.toLocaleString()}/mese</div>
            </div>
          </div>
        </div>

        {/* Stats and Expectations */}
        <div className="bg-white bg-opacity-60 rounded-lg p-4 mb-4">
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <span className="text-gray-600">Tempo Generazione:</span>
              <div className="font-medium">~{generationTime}s</div>
            </div>
            <div>
              <span className="text-gray-600">Valore Atteso:</span>
              <div className="font-medium text-green-600">
                €{Math.round(expectedValue.min).toLocaleString()} - €{Math.round(expectedValue.max).toLocaleString()}
              </div>
            </div>
          </div>
        </div>

        {/* Status and Actions */}
        <div className="space-y-3">
          {/* Status */}
          <div className="flex items-center justify-center">
            <div className={`inline-flex items-center px-4 py-2 rounded-full text-sm font-medium ${
              isGenerating 
                ? 'bg-orange-100 text-orange-800'
                : canGenerate
                ? 'bg-green-100 text-green-800'
                : 'bg-gray-100 text-gray-800'
            }`}>
              {isGenerating ? (
                <>
                  <Clock className="h-4 w-4 mr-2 animate-spin" />
                  Generando Progetto...
                </>
              ) : canGenerate ? (
                <>
                  <CheckCircle2 className="h-4 w-4 mr-2" />
                  Disponibile
                </>
              ) : (
                <>
                  <AlertCircle className="h-4 w-4 mr-2" />
                  Non Disponibile
                </>
              )}
            </div>
          </div>

          {/* Progress Bar for Generation */}
          {isGenerating && (
            <div className="space-y-2">
              <div className="flex justify-between text-xs text-gray-600">
                <span>Progresso Generazione</span>
                <span>{progress}%</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-3">
                <div 
                  className="bg-gradient-to-r from-orange-500 to-yellow-500 h-3 rounded-full transition-all duration-500"
                  style={{ width: `${progress}%` }}
                ></div>
              </div>
            </div>
          )}

          {/* Action Button */}
          <button
            onClick={() => handleGenerateProject(salesPerson.id)}
            disabled={!canGenerate || generating === salesPerson.id}
            className={`w-full py-3 px-4 rounded-lg font-medium transition-all duration-200 flex items-center justify-center ${
              canGenerate && generating !== salesPerson.id
                ? 'bg-green-600 hover:bg-green-700 text-white shadow-md hover:shadow-lg transform hover:-translate-y-0.5'
                : 'bg-gray-300 text-gray-500 cursor-not-allowed'
            }`}
          >
            {generating === salesPerson.id ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                Avviando...
              </>
            ) : isGenerating ? (
              <>
                <Clock className="h-4 w-4 mr-2" />
                In Generazione...
              </>
            ) : canGenerate ? (
              <>
                <Play className="h-4 w-4 mr-2" />
                Genera Progetto
              </>
            ) : (
              'Non Disponibile'
            )}
          </button>
        </div>
      </div>
    );
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex justify-between items-center">
        <h2 className="text-3xl font-bold text-white flex items-center">
          <Briefcase className="h-8 w-8 mr-3" />
          Reparto Sales
        </h2>
        <div className="flex items-center gap-4">
          <div className="text-white text-sm opacity-75 bg-white bg-opacity-10 rounded-lg px-4 py-2">
            Commerciali: {game?.sales?.length || 0} • Progetti Generati: {game?.projects?.length || 0}
          </div>
          <button 
            onClick={onRefresh}
            disabled={loading}
            className="bg-white bg-opacity-20 text-white px-4 py-2 rounded-lg hover:bg-opacity-30 transition-colors disabled:opacity-50"
          >
            {loading ? '⏳' : '🔄'} Aggiorna
          </button>
        </div>
      </div>

      {/* Messages */}
      {error && (
        <div className="bg-red-500 text-white p-4 rounded-xl flex items-center">
          <AlertCircle className="h-5 w-5 mr-2" />
          {error}
        </div>
      )}
      
      {success && (
        <div className="bg-green-500 text-white p-4 rounded-xl flex items-center">
          <CheckCircle2 className="h-5 w-5 mr-2" />
          {success}
        </div>
      )}

      {/* Sales Team */}
      <div className="bg-white bg-opacity-95 backdrop-blur-lg rounded-2xl p-8">
        <h3 className="text-2xl font-semibold mb-6 flex items-center">
          <Target className="h-6 w-6 mr-2" />
          I Tuoi Commerciali ({game?.sales?.length || 0})
        </h3>

        {game?.sales?.length > 0 ? (
          <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
            {game.sales.map(salesPerson => (
              <SalesPersonCard key={salesPerson.id} salesPerson={salesPerson} />
            ))}
          </div>
        ) : (
          <div className="text-center text-gray-500 py-12">
            <div className="text-4xl mb-4">💼</div>
            <p className="text-lg mb-2">Nessun commerciale nel team</p>
            <p className="text-sm">Vai su <strong>HR</strong> per assumere commerciali e iniziare a generare progetti!</p>
          </div>
        )}
      </div>

      {/* Recent Projects Generated */}
      {game?.projects?.length > 0 && (
        <div className="bg-white bg-opacity-95 backdrop-blur-lg rounded-2xl p-8">
          <h3 className="text-2xl font-semibold mb-6 flex items-center">
            <TrendingUp className="h-6 w-6 mr-2" />
            Progetti Generati Recentemente
          </h3>
          
          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
            {game.projects.slice(-6).reverse().map(project => (
              <div 
                key={project.id} 
                className={`p-4 rounded-lg border-2 ${
                  project.status === 'completed' 
                    ? 'bg-green-50 border-green-300' 
                    : project.status === 'in_progress'
                    ? 'bg-blue-50 border-blue-300'
                    : 'bg-yellow-50 border-yellow-300'
                }`}
              >
                <div className="font-semibold text-gray-800 mb-2">{project.name}</div>
                <div className="text-sm text-gray-600 space-y-1">
                  <div>Complessità: <span className="font-medium">{project.complexity}/5</span></div>
                  <div>Valore: <span className="font-medium text-green-600">€{project.value?.toLocaleString()}</span></div>
                  <div className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                    project.status === 'completed' 
                      ? 'bg-green-100 text-green-800' 
                      : project.status === 'in_progress'
                      ? 'bg-blue-100 text-blue-800'
                      : 'bg-yellow-100 text-yellow-800'
                  }`}>
                    {project.status === 'completed' ? '✅ Completato' : 
                     project.status === 'in_progress' ? '⏳ In Corso' : '📋 In Attesa'}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Sales Performance Stats */}
      {game?.sales?.length > 0 && (
        <div className="bg-white bg-opacity-95 backdrop-blur-lg rounded-2xl p-8">
          <h3 className="text-2xl font-semibold mb-6 flex items-center">
            <DollarSign className="h-6 w-6 mr-2" />
            Performance del Team
          </h3>
          
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            <div className="text-center p-4 bg-blue-50 rounded-xl">
              <div className="text-2xl font-bold text-blue-600">{game.sales.length}</div>
              <div className="text-sm text-gray-600">Commerciali Attivi</div>
            </div>
            
            <div className="text-center p-4 bg-green-50 rounded-xl">
              <div className="text-2xl font-bold text-green-600">
                {game.sales.filter(s => s.status === 'available').length}
              </div>
              <div className="text-sm text-gray-600">Disponibili</div>
            </div>
            
            <div className="text-center p-4 bg-orange-50 rounded-xl">
              <div className="text-2xl font-bold text-orange-600">
                {game.sales.filter(s => s.status === 'generating').length}
              </div>
              <div className="text-sm text-gray-600">Generando</div>
            </div>
            
            <div className="text-center p-4 bg-purple-50 rounded-xl">
              <div className="text-2xl font-bold text-purple-600">
                €{(game.projects?.reduce((sum, p) => p.status === 'completed' ? sum + (p.value || 0) : sum, 0) || 0).toLocaleString()}
              </div>
              <div className="text-sm text-gray-600">Valore Totale Generato</div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default SalesScreen;