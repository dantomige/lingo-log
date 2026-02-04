/**
 * DictionaryService
 * 
 * Service to fetch word details from an external dictionary API
 */

class DictionaryService {

    static #API_URL = 'https://api.dictionaryapi.dev/api/v2/entries/en/';

    static #wordDataToVocabEntry(wordData) {
        const word = wordData[0].word;
        const meanings = wordData[0].meanings;

        const mostFrequentMeaning = meanings[0]

        const partofSpeech = mostFrequentMeaning.partOfSpeech

        const definitions = mostFrequentMeaning.definitions
        const definition = definitions[0].definition
        const example = definitions[0].example

        return new VocabEntry(word, definition, partofSpeech, example);        
    }

    /**
     * 
     * Fetch information for a single word and convert it to a VocabEntry
     * 
     * @param {string} word 
     * @returns VocabEntry representing the word details
     * @throws Error if fetching or conversion fails
     */
    static async fetchDetails(word) {
        
        const response = await fetch(this.#API_URL + word);

        if (!response.ok) {
            throw new Error(`Failed to fetch data for word: ${word}, status: ${response.status}`);
        }

        const wordData = await response.json();
        return this.#wordDataToVocabEntry(wordData);
    }

    /**
     * 
     * Fetch information for a batch of words and convert them to VocabEntry objects
     * 
     * @param {string[]} words 
     * @returns VocabEntry[] array representing the word details
     */
    static async fetchDetailsBatch(words) {
        const wordDetailPromises = words.map(word => this.fetchDetails(word));
        const wordDetailResults = await Promise.allSettled(wordDetailPromises);

        const successfulResults = wordDetailResults
            .filter(result => result.status === "fulfilled")
            .map(result => result.value);

        const failedResults = wordDetailResults
            .filter(result => result.status === "rejected")
            .map((r, index) => ({ word: words[index], error: r.reason.message }));

        if (failedResults.length > 0) {
            console.warn("Some words could not be defined:", failedResults);
        }

        console.log(`Successfully fetched details for ${successfulResults.length} out of ${words.length} words.`);

        return successfulResults;
    }
}