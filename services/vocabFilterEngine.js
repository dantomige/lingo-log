class VocabFilterEngine {

    static #isActualSearch(historyItem) {
        const url = new URL(historyItem.url);

        const isGoogle = url.hostname.includes("google.com");
        const isSearchPage = url.pathname.includes("/search");
        const hasQuery = url.searchParams.has('q');

        return isGoogle && isSearchPage && hasQuery;
    }

    static #filterForSearchHistory(history) {
        const searchHistory = history.filter(historyItem => this.#isActualSearch(historyItem));
        return searchHistory;
    };

    static #getGoogleSearchInputs(searchHistory) {
        const googleSearchInputs = searchHistory.map(historyItem => {
            const url = new URL(historyItem.url);
            const searchInput = url.searchParams.get("q");
            return searchInput;
        });
        return googleSearchInputs;
    };

    static #filterForVocabularyQueries(googleSearchInputs, keywords) {
        
        const vocabSearchInputs = googleSearchInputs.filter(input => {
            for (let keyword of keywords) {
                if (input.toLowerCase().includes(keyword.toLowerCase())) {
                    return true;
                }
            }
            return false;
        });

        return vocabSearchInputs;
    }

    static #getVocabularyWords(vocabSearchInputs) {
        const vocabWords = vocabSearchInputs.map(query => {
        return query
            .replace(/\b(definition|meaning|synonym|etymology|define|what is|in english|french|spanish|yoruba)\b/gi, '')
            .replace(/[0-9]+\./g, '')
            .trim();
        });
        return vocabWords;
    }

    /**
     * 
     * Extract vocabulary words from browsing history
     * 
     * @param {chrome.history.HistoryItem[]} history - Array of history items
     * @param {string[]} keywords - Array of keywords to filter vocabulary queries
     * @returns {string[]} - Array of vocabulary words extracted from history
     */
    static extractVocab(history, keywords)  {
        // Extract search history
        const searchHistory = this.#filterForSearchHistory(history);

        // Get Google search inputs
        const googleSearchInputs = this.#getGoogleSearchInputs(searchHistory);

        // Filter for vocabulary-related queries
        const vocabSearchInputs = this.#filterForVocabularyQueries(googleSearchInputs, keywords);

        // Extract vocabulary words
        const vocabWords = this.#getVocabularyWords(vocabSearchInputs);
        
        return vocabWords;
    }
}