import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

const api = axios.create({
  baseURL: `${API_BASE_URL}/api`,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor for logging (opzionale - puoi rimuovere se non vuoi i log)
api.interceptors.request.use(
  (config) => {
    console.log(`🔄 API Request: ${config.method?.toUpperCase()} ${config.url}`);
    return config;
  },
  (error) => {
    console.error('❌ API Request Error:', error);
    return Promise.reject(error);
  }
);

// Response interceptor for logging (opzionale - puoi rimuovere se non vuoi i log)
api.interceptors.response.use(
  (response) => {
    console.log(`✅ API Response: ${response.config.url} - ${response.status}`);
    return response;
  },
  (error) => {
    console.error('❌ API Response Error:', error.response?.data || error.message);
    return Promise.reject(error);
  }
);

// Game API (mantengo i tuoi + aggiungo getAllGames alias)
export const gameApi = {
  getGames: () => api.get('/games'),
  getAllGames: () => api.get('/games'), // Alias per compatibilità con HomeScreen
  createGame: () => api.post('/games'),
  getGame: (id) => api.get(`/games/${id}`),
  updateGame: (id, data) => api.put(`/games/${id}`, data),
  deleteGame: (id) => api.delete(`/games/${id}`),
  autoSave: (id, gameState) => api.post(`/games/${id}/autosave`, gameState),
};

// Project API (mantengo i tuoi)
export const projectApi = {
  getProjects: (gameId) => api.get(`/games/${gameId}/projects`),
  assignProject: (gameId, projectId, developerId) => 
    api.post(`/games/${gameId}/projects/assign`, { projectId, developerId }),
};

// Sales API (NUOVO - necessario per SalesScreen)
export const salesApi = {
  getSales: (gameId) => api.get(`/games/${gameId}/sales`),
  generateProject: (gameId, salesId) => api.post(`/games/${gameId}/sales/${salesId}/generate-project`),
};

// HR API (NUOVO - necessario per HRScreen)
export const hrApi = {
  getMarketResources: (type = null) => {
    const url = type ? `/hr/market?type=${type}` : '/hr/market';
    return api.get(url);
  },
  hireResource: (gameId, resourceId, resourceType) => 
    api.post(`/games/${gameId}/hr/hire`, { resourceId, resourceType }),
};

export default api;