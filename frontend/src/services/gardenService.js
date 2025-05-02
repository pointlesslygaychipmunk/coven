// Base API URL
const API_URL = process.env.NODE_ENV === 'production'
    ? '/api'
    : 'http://localhost:3001/api';
/**
 * Service for interacting with the garden-related backend APIs
 */
class GardenService {
    /**
     * Plant a seed in a garden plot
     */
    async plantSeed(playerId, plotId, seedId, miniGameResult, currentSeason, currentMoonPhase, currentWeather) {
        try {
            const response = await fetch(`${API_URL}/garden/plant`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    playerId,
                    plotId,
                    seedId,
                    miniGameResult,
                    currentSeason,
                    currentMoonPhase,
                    currentWeather
                }),
            });
            if (!response.ok) {
                const errorData = await response.json();
                return { success: false, error: errorData.message || 'Failed to plant seed' };
            }
            const data = await response.json();
            return { success: true, data };
        }
        catch (error) {
            return {
                success: false,
                error: error instanceof Error ? error.message : 'An unknown error occurred'
            };
        }
    }
    /**
     * Harvest a mature plant from a garden plot
     */
    async harvestPlant(playerId, plotId, miniGameResult, currentSeason, currentMoonPhase) {
        try {
            const response = await fetch(`${API_URL}/garden/harvest`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    playerId,
                    plotId,
                    miniGameResult,
                    currentSeason,
                    currentMoonPhase
                }),
            });
            if (!response.ok) {
                const errorData = await response.json();
                return { success: false, error: errorData.message || 'Failed to harvest plant' };
            }
            const data = await response.json();
            return { success: true, data };
        }
        catch (error) {
            return {
                success: false,
                error: error instanceof Error ? error.message : 'An unknown error occurred'
            };
        }
    }
    /**
     * Water a specific garden plot
     */
    async waterPlot(playerId, plotId, miniGameResult, currentWeather) {
        try {
            const response = await fetch(`${API_URL}/garden/water`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    playerId,
                    plotId,
                    miniGameResult,
                    currentWeather
                }),
            });
            if (!response.ok) {
                const errorData = await response.json();
                return { success: false, error: errorData.message || 'Failed to water plot' };
            }
            const data = await response.json();
            return { success: true, data };
        }
        catch (error) {
            return {
                success: false,
                error: error instanceof Error ? error.message : 'An unknown error occurred'
            };
        }
    }
    /**
     * Water all garden plots at once (used with seasonal attunement)
     */
    async waterAllPlots(playerId, attunementBonus) {
        try {
            const response = await fetch(`${API_URL}/garden/water-all`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    playerId,
                    attunementBonus
                }),
            });
            if (!response.ok) {
                const errorData = await response.json();
                return { success: false, error: errorData.message || 'Failed to water all plots' };
            }
            const data = await response.json();
            return { success: true, data };
        }
        catch (error) {
            return {
                success: false,
                error: error instanceof Error ? error.message : 'An unknown error occurred'
            };
        }
    }
    /**
     * Protect a plant from adverse weather conditions
     */
    async protectPlant(playerId, plotId, miniGameResult, currentWeather) {
        try {
            const response = await fetch(`${API_URL}/garden/protect`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    playerId,
                    plotId,
                    miniGameResult,
                    currentWeather
                }),
            });
            if (!response.ok) {
                const errorData = await response.json();
                return { success: false, error: errorData.message || 'Failed to protect plant' };
            }
            const data = await response.json();
            return { success: true, data };
        }
        catch (error) {
            return {
                success: false,
                error: error instanceof Error ? error.message : 'An unknown error occurred'
            };
        }
    }
    /**
     * Cross-breed two plants to create a new variety
     */
    async crossBreedPlants(playerId, plant1Id, plant2Id, currentSeason, currentMoonPhase) {
        try {
            const response = await fetch(`${API_URL}/garden/cross-breed`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    playerId,
                    plant1Id,
                    plant2Id,
                    currentSeason,
                    currentMoonPhase
                }),
            });
            if (!response.ok) {
                const errorData = await response.json();
                return { success: false, error: errorData.message || 'Failed to cross-breed plants' };
            }
            const data = await response.json();
            return { success: true, data };
        }
        catch (error) {
            return {
                success: false,
                error: error instanceof Error ? error.message : 'An unknown error occurred'
            };
        }
    }
    /**
     * Get details on all available plant varieties
     */
    async getPlantVarieties() {
        try {
            const response = await fetch(`${API_URL}/garden/varieties`);
            if (!response.ok) {
                const errorData = await response.json();
                return { success: false, error: errorData.message || 'Failed to get plant varieties' };
            }
            const data = await response.json();
            return { success: true, data };
        }
        catch (error) {
            return {
                success: false,
                error: error instanceof Error ? error.message : 'An unknown error occurred'
            };
        }
    }
    /**
     * Get updated garden state for a player
     */
    async getGardenState(playerId) {
        try {
            const response = await fetch(`${API_URL}/garden/state/${playerId}`);
            if (!response.ok) {
                const errorData = await response.json();
                return { success: false, error: errorData.message || 'Failed to get garden state' };
            }
            const data = await response.json();
            return { success: true, data };
        }
        catch (error) {
            return {
                success: false,
                error: error instanceof Error ? error.message : 'An unknown error occurred'
            };
        }
    }
}
// Export a singleton instance
export const gardenService = new GardenService();
export default gardenService;
//# sourceMappingURL=gardenService.js.map