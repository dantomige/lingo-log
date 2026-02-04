/**
 * HistoryProvider
 * 
 * Service to access browsing history using Chrome API
 */

export class HistoryProvider {
    static #MAX_HISTORY_RESULTS = 2147483647; // Largest integer for Chrome history API

    /**
     * 
     * Access browsing history using Chrome API
     * 
     * @param {number} startTime - Timestamp in milliseconds to start fetching from
     * @param {number} endTime - Timestamp in milliseconds to end fetching at
     * @param {number} numResults - Maximum number of results to fetch
     * @returns Promise<chrome.history.HistoryItem[]> - Array of history items
     */
    static async fetchHistory(startTime, endTime, numResults = this.#MAX_HISTORY_RESULTS) {
        return new Promise((resolve) => {
            chrome.history.search({ 
                text: '', 
                maxResults: numResults, 
                startTime: startTime,
                endTime: endTime
            }, resolve);
        });
    };
}