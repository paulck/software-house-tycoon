import React, { useState, useEffect } from 'react';
import { projectApi } from '../services/api';

const ProductionScreen = ({ game, onUpdateGame, onRefresh }) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const pendingProjects = game?.projects?.filter(p => p.status === 'pending') || [];
  const activeProjects = game?.projects?.filter(p => p.status === 'in_progress') || [];
  const completedProjects = game?.projects?.filter(p => p.status === 'completed') || [];
  const availableDevelopers = game?.developers?.filter(d => d.status === 'available') || [];

  // Auto-refresh per vedere progetti completati
  useEffect(() => {
    if (activeProjects.length > 0) {
      const interval = setInterval(() => {
        onRefresh();
      }, 5000); // Refresh ogni 5 secondi

      return () => clearInterval(interval);
    }
  }, [activeProjects.length, onRefresh]);

  const handleAssignProject = async (projectId, developerId) => {
    try {
      setLoading(true);
      setError(null);
      
      console.log(`🎯 Assigning project ${projectId} to developer ${developerId}`);
      
      await projectApi.assignProject(game.id, projectId, developerId);
      
      console.log('✅ Project assigned successfully');
      setTimeout(() => {
        onRefresh();
      }, 500);
      
    } catch (error) {
      console.error('❌ Failed to assign project:', error);
      setError('Errore nell\'assegnazione del progetto');
    } finally {
      setLoading(false);
    }
  };

  const ProjectProgressBar = ({ project }) => {
    if (!project.started_at || !project.completion_time) return null;

    const startTime = new Date(project.started_at).getTime();
    const completionTime = project.completion_time * 1000; // Convert to milliseconds
    const elapsed = Date.now() - startTime;
    const progress = Math.min((elapsed / completionTime) * 100, 100);
    const timeLeft = Math.max(0, completionTime - elapsed);

    return (
      <div className="mt-3">
        <div className="flex justify-between text-sm text-gray-600 mb-1">
          <span>Progresso</span>
          <span>{timeLeft > 0 ? `${Math.ceil(timeLeft / 1000)}s rimanenti` : 'Completando...'}</span>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-3">
          <div 
            className="bg-gradient-to-r from-blue-500 to-blue-600 h-3 rounded-full transition-all duration-500"
            style={{ width: `${progress}%` }}
          ></div>
        </div>
        <div className="text-xs text-gray-500 mt-1">{Math.round(progress)}% completato</div>
      </div>
    );
  };

  return (
    <div className="space-y-8">
      <div className="flex justify-between items-center">
        <h2 className="text-3xl font-bold text-white">🏗️ Produzione</h2>
        <div className="flex items-center gap-4">
          <div className="text-white text-sm opacity-75 bg-white bg-opacity-10 rounded-lg px-4 py-2">
            Progetti: {pendingProjects.length} pending • {activeProjects.length} attivi • {completedProjects.length} completati
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

      {error && (
        <div className="bg-red-500 text-white p-4 rounded-xl">
          ❌ {error}
        </div>
      )}

      <div className="grid lg:grid-cols-2 gap-8">
        {/* Developers */}
        <div className="bg-white bg-opacity-95 backdrop-blur-lg rounded-2xl p-8">
          <h3 className="text-2xl font-semibold mb-6 flex items-center gap-3">
            👨‍💻 Developers ({game?.developers?.length || 0})
          </h3>
          <div className="space-y-4">
            {game?.developers?.map(dev => (
              <div key={dev.id} className={`p-6 border rounded-xl ${dev.status === 'busy' ? 'bg-orange-50 border-orange-200' : 'bg-green-50 border-green-200'}`}>
                <div className="font-semibold text-lg text-gray-800 mb-2">{dev.name}</div>
                <div className="text-gray-600 mb-3">
                  <div className="mb-1">Seniority: <span className="font-medium">{dev.seniority}/5</span></div>
                  <div>Stipendio: <span className="font-medium">€{dev.salary?.toLocaleString()}/mese</span></div>
                </div>
                <div className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${
                  dev.status === 'available' ? 'bg-green-100 text-green-800' : 'bg-orange-100 text-orange-800'
                }`}>
                  {dev.status === 'available' ? '✅ Disponibile' : '⏳ Occupato'}
                </div>
                {dev.status === 'busy' && dev.current_project_id && (
                  <div className="mt-2 text-xs text-gray-600">
                    Progetto: {game?.projects?.find(p => p.id === dev.current_project_id)?.name}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Projects */}
        <div className="bg-white bg-opacity-95 backdrop-blur-lg rounded-2xl p-8">
          <h3 className="text-2xl font-semibold mb-6 flex items-center gap-3">
            📋 Progetti
          </h3>
          
          {/* Pending Projects */}
          {pendingProjects.length > 0 && (
            <div className="mb-8">
              <h4 className="font-semibold text-lg text-gray-700 mb-4">In Attesa di Assegnazione</h4>
              <div className="space-y-4">
                {pendingProjects.map(project => (
                  <div key={project.id} className="p-6 rounded-xl bg-gradient-to-r from-yellow-50 to-orange-50 border-l-4 border-yellow-500">
                    <div className="font-semibold text-lg text-gray-800 mb-2">{project.name}</div>
                    <div className="text-gray-600 mb-4">
                      <div className="mb-1">Complessità: <span className="font-medium">{project.complexity}/5</span></div>
                      <div>Valore: <span className="font-medium text-green-600">€{project.value?.toLocaleString()}</span></div>
                    </div>
                    
                    {availableDevelopers.length > 0 ? (
                      <select 
                        onChange={(e) => {
                          if (e.target.value) {
                            handleAssignProject(project.id, parseInt(e.target.value));
                            e.target.value = ''; // Reset select
                          }
                        }}
                        className="w-full border border-gray-300 rounded-lg px-3 py-2 bg-white"
                        defaultValue=""
                        disabled={loading}
                      >
                        <option value="">Seleziona Developer</option>
                        {availableDevelopers.map(dev => (
                          <option key={dev.id} value={dev.id}>
                            {dev.name} (Seniority {dev.seniority}/5) - Tempo: ~{Math.round((project.complexity * 10) / dev.seniority)}s
                          </option>
                        ))}
                      </select>
                    ) : (
                      <div className="text-sm text-gray-500 italic p-3 bg-gray-100 rounded">
                        Nessun developer disponibile
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Active Projects */}
          {activeProjects.length > 0 && (
            <div className="mb-8">
              <h4 className="font-semibold text-lg text-gray-700 mb-4">In Corso</h4>
              <div className="space-y-4">
                {activeProjects.map(project => {
                  const developer = game?.developers?.find(d => d.id === project.assigned_developer_id);
                  return (
                    <div key={project.id} className="p-6 rounded-xl bg-gradient-to-r from-blue-50 to-indigo-50 border-l-4 border-blue-500">
                      <div className="font-semibold text-lg text-gray-800 mb-2">{project.name}</div>
                      <div className="text-gray-600 mb-3">
                        <div className="mb-1">Sviluppato da: <span className="font-medium">{developer?.name}</span></div>
                        <div>Valore: <span className="font-medium text-green-600">€{project.value?.toLocaleString()}</span></div>
                      </div>
                      <ProjectProgressBar project={project} />
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Completed Projects */}
          {completedProjects.length > 0 && (
            <div>
              <h4 className="font-semibold text-lg text-gray-700 mb-4">Completati Recentemente</h4>
              <div className="space-y-3 max-h-64 overflow-y-auto">
                {completedProjects.slice(-5).reverse().map(project => (
                  <div key={project.id} className="p-4 rounded-lg bg-gradient-to-r from-green-50 to-emerald-50 border-l-4 border-green-500">
                    <div className="font-medium text-gray-800">{project.name}</div>
                    <div className="text-sm text-gray-600 mt-1">
                      €{project.value?.toLocaleString()} incassati ✅
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Empty State */}
          {pendingProjects.length === 0 && activeProjects.length === 0 && completedProjects.length === 0 && (
            <div className="text-center text-gray-500 py-12">
              <div className="text-4xl mb-4">📭</div>
              <p className="text-lg mb-2">Nessun progetto disponibile</p>
              <p className="text-sm">Vai su <strong>Sales</strong> per generarne di nuovi!</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ProductionScreen;
