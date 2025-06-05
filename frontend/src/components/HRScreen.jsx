import React, { useState, useEffect } from 'react';
import { hrApi } from '../services/api';
import { Users, DollarSign, Star, TrendingUp, AlertCircle, CheckCircle2 } from 'lucide-react';

const HRScreen = ({ game, onUpdateGame, onRefresh }) => {
  const [marketResources, setMarketResources] = useState({ developers: [], sales: [] });
  const [loading, setLoading] = useState(false);
  const [hiring, setHiring] = useState(null);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);

  // Load market resources on component mount
  useEffect(() => {
    loadMarketResources();
  }, []);

  const loadMarketResources = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await hrApi.getMarketResources();
      const resources = response.data.data || [];
      
      // Separa developers e sales dal backend
      const developers = resources.filter(r => r.type === 'developer');
      const sales = resources.filter(r => r.type === 'sales');
      
      setMarketResources({ developers, sales });
    } catch (error) {
      console.error('Failed to load market resources:', error);
      setError('Errore nel caricamento del mercato delle risorse');
    } finally {
      setLoading(false);
    }
  };

  const hireResource = async (resourceId, resourceType) => {
    try {
      setHiring(resourceId);
      setError(null);
      setSuccess(null);
      
      console.log(`💼 Hiring ${resourceType} with ID ${resourceId}`);
      
      await hrApi.hireResource(game.id, resourceId, resourceType);
      
      setSuccess(`✅ ${resourceType === 'developer' ? 'Sviluppatore' : 'Commerciale'} assunto con successo!`);
      
      // Refresh game data and market resources
      setTimeout(() => {
        onRefresh();
        loadMarketResources();
      }, 500);
      
    } catch (error) {
      console.error('Failed to hire resource:', error);
      setError(`Errore nell'assunzione: ${error.response?.data?.error || error.message}`);
    } finally {
      setHiring(null);
      
      // Clear messages after 3 seconds
      setTimeout(() => {
        setSuccess(null);
        setError(null);
      }, 3000);
    }
  };

  const canAfford = (cost) => {
    return game?.patrimonio >= cost;
  };

  const renderStars = (level) => {
    return Array.from({ length: 5 }, (_, i) => (
      <Star 
        key={i} 
        className={`h-4 w-4 ${i < level ? 'text-yellow-400 fill-current' : 'text-gray-300'}`} 
      />
    ));
  };

  const ResourceCard = ({ resource, type, onHire, canHire, isHiring }) => (
    <div className="bg-white rounded-xl shadow-md hover:shadow-lg transition-all duration-300 border border-gray-200 overflow-hidden">
      <div className="p-6">
        <div className="flex items-start justify-between mb-4">
          <div>
            <h4 className="text-lg font-semibold text-gray-800 mb-1">{resource.name}</h4>
            <div className="flex items-center space-x-1 mb-2">
              {renderStars(resource.skill_level)}
              <span className="text-sm text-gray-600 ml-2">
                {type === 'developer' ? 'Seniority' : 'Esperienza'}: {resource.skill_level}/5
              </span>
            </div>
          </div>
          <div className={`p-2 rounded-lg ${type === 'developer' ? 'bg-blue-100' : 'bg-green-100'}`}>
            {type === 'developer' ? '👨‍💻' : '💼'}
          </div>
        </div>
        
        <div className="space-y-3 mb-4">
          <div className="flex items-center justify-between text-sm">
            <span className="text-gray-600">Costo Assunzione:</span>
            <span className="font-semibold text-gray-800">€{resource.hiring_cost?.toLocaleString()}</span>
          </div>
          <div className="flex items-center justify-between text-sm">
            <span className="text-gray-600">Stipendio Mensile:</span>
            <span className="font-semibold text-red-600">€{resource.monthly_salary?.toLocaleString()}</span>
          </div>
        </div>
        
        <button
          onClick={() => onHire(resource.id, type)}
          disabled={!canHire || isHiring}
          className={`w-full py-3 px-4 rounded-lg font-medium transition-all duration-200 ${
            canHire && !isHiring
              ? `${type === 'developer' ? 'bg-blue-600 hover:bg-blue-700' : 'bg-green-600 hover:bg-green-700'} text-white shadow-md hover:shadow-lg transform hover:-translate-y-0.5`
              : 'bg-gray-300 text-gray-500 cursor-not-allowed'
          }`}
        >
          {isHiring ? (
            <div className="flex items-center justify-center">
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
              Assumendo...
            </div>
          ) : !canHire ? (
            'Fondi Insufficienti'
          ) : (
            `Assumi (€${resource.hiring_cost?.toLocaleString()})`
          )}
        </button>
      </div>
    </div>
  );

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex justify-between items-center">
        <h2 className="text-3xl font-bold text-white flex items-center">
          <Users className="h-8 w-8 mr-3" />
          Risorse Umane
        </h2>
        <button 
          onClick={loadMarketResources}
          disabled={loading}
          className="bg-white bg-opacity-20 text-white px-4 py-2 rounded-lg hover:bg-opacity-30 transition-colors disabled:opacity-50"
        >
          {loading ? '⏳' : '🔄'} Aggiorna Mercato
        </button>
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

      {/* Current Team Overview */}
      <div className="bg-white bg-opacity-95 backdrop-blur-lg rounded-2xl p-8">
        <h3 className="text-2xl font-semibold mb-6 flex items-center">
          <Users className="h-6 w-6 mr-2" />
          Il Tuo Team
        </h3>
        
        <div className="grid md:grid-cols-2 gap-6 mb-6">
          {/* Developers */}
          <div className="bg-blue-50 rounded-xl p-6">
            <h4 className="font-semibold text-blue-800 mb-4 flex items-center">
              👨‍💻 Sviluppatori ({game?.developers?.length || 0})
            </h4>
            <div className="space-y-3 max-h-48 overflow-y-auto">
              {game?.developers?.length > 0 ? (
                game.developers.map(dev => (
                  <div key={dev.id} className="flex justify-between items-center p-3 bg-white rounded-lg">
                    <div>
                      <span className="font-medium">{dev.name}</span>
                      <div className="flex items-center mt-1">
                        {renderStars(dev.seniority)}
                      </div>
                    </div>
                    <div className="text-right text-sm">
                      <div className="text-gray-600">€{dev.salary?.toLocaleString()}/mese</div>
                      <div className={`text-xs ${dev.status === 'available' ? 'text-green-600' : 'text-orange-600'}`}>
                        {dev.status === 'available' ? 'Disponibile' : 'Occupato'}
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                <p className="text-gray-500 italic">Nessun sviluppatore assunto</p>
              )}
            </div>
          </div>

          {/* Sales People - ADATTATO per il tuo backend */}
          <div className="bg-green-50 rounded-xl p-6">
            <h4 className="font-semibold text-green-800 mb-4 flex items-center">
              💼 Commerciali ({game?.sales?.length || 0})
            </h4>
            <div className="space-y-3 max-h-48 overflow-y-auto">
              {game?.sales?.length > 0 ? (
                game.sales.map(sales => (
                  <div key={sales.id} className="flex justify-between items-center p-3 bg-white rounded-lg">
                    <div>
                      <span className="font-medium">{sales.name}</span>
                      <div className="flex items-center mt-1">
                        {renderStars(sales.experience)}
                      </div>
                    </div>
                    <div className="text-right text-sm">
                      <div className="text-gray-600">€{sales.salary?.toLocaleString()}/mese</div>
                      <div className={`text-xs ${sales.status === 'available' ? 'text-green-600' : 'text-orange-600'}`}>
                        {sales.status === 'available' ? 'Disponibile' : 'Generando'}
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                <p className="text-gray-500 italic">Nessun commerciale assunto</p>
              )}
            </div>
          </div>
        </div>

        {/* Cost Summary */}
        <div className="bg-gray-50 rounded-xl p-6">
          <div className="flex justify-between items-center">
            <span className="font-semibold text-lg flex items-center">
              <DollarSign className="h-5 w-5 mr-2" />
              Costi Totali Mensili:
            </span>
            <span className="text-xl font-bold text-red-600">
              €{game?.monthly_costs?.toLocaleString() || '0'}
            </span>
          </div>
          <div className="mt-2 text-sm text-gray-600">
            Patrimonio attuale: <span className="font-medium">€{game?.patrimonio?.toLocaleString()}</span>
            {game?.patrimonio < game?.monthly_costs && game?.monthly_costs > 0 && (
              <span className="text-red-600 ml-2 font-medium">⚠️ Rischio fallimento!</span>
            )}
          </div>
        </div>
      </div>

      {/* Market Resources */}
      <div className="grid lg:grid-cols-2 gap-8">
        {/* Available Developers */}
        <div className="bg-white bg-opacity-95 backdrop-blur-lg rounded-2xl p-8">
          <h3 className="text-2xl font-semibold mb-6 flex items-center">
            👨‍💻 Sviluppatori Disponibili
          </h3>
          
          {loading ? (
            <div className="space-y-4">
              {[...Array(3)].map((_, i) => (
                <div key={i} className="animate-pulse bg-gray-200 h-32 rounded-xl"></div>
              ))}
            </div>
          ) : marketResources.developers.length > 0 ? (
            <div className="grid gap-4">
              {marketResources.developers.map(developer => (
                <ResourceCard
                  key={developer.id}
                  resource={developer}
                  type="developer"
                  onHire={hireResource}
                  canHire={canAfford(developer.hiring_cost)}
                  isHiring={hiring === developer.id}
                />
              ))}
            </div>
          ) : (
            <div className="text-center text-gray-500 py-12">
              <div className="text-4xl mb-4">🔍</div>
              <p className="text-lg">Nessuno sviluppatore disponibile</p>
              <p className="text-sm">Prova ad aggiornare il mercato</p>
            </div>
          )}
        </div>

        {/* Available Sales */}
        <div className="bg-white bg-opacity-95 backdrop-blur-lg rounded-2xl p-8">
          <h3 className="text-2xl font-semibold mb-6 flex items-center">
            💼 Commerciali Disponibili
          </h3>
          
          {loading ? (
            <div className="space-y-4">
              {[...Array(3)].map((_, i) => (
                <div key={i} className="animate-pulse bg-gray-200 h-32 rounded-xl"></div>
              ))}
            </div>
          ) : marketResources.sales.length > 0 ? (
            <div className="grid gap-4">
              {marketResources.sales.map(sales => (
                <ResourceCard
                  key={sales.id}
                  resource={sales}
                  type="sales"
                  onHire={hireResource}
                  canHire={canAfford(sales.hiring_cost)}
                  isHiring={hiring === sales.id}
                />
              ))}
            </div>
          ) : (
            <div className="text-center text-gray-500 py-12">
              <div className="text-4xl mb-4">🔍</div>
              <p className="text-lg">Nessun commerciale disponibile</p>
              <p className="text-sm">Prova ad aggiornare il mercato</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default HRScreen;
