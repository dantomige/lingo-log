import { VocabFilterEngine } from './vocabFilterEngine.js';
import { DictionaryService } from './dictionaryService.js';
import { VocabStorage } from '../storage.js';

export class SafariImportService {

    static #convertSafariHistory(safariJSON) {
        const history = safariJSON.history;
        const urlHistory = history.map((historyItem) => new URL(historyItem.url))
        return urlHistory
    }

    static async #saveSafariHistory(safariURLHistory) {
        const vocabSearchTerms = VocabFilterEngine.extractVocab(safariURLHistory);
        const vocabModels = await DictionaryService.fetchDetailsBatch(vocabSearchTerms);
        await VocabStorage.updateVocabEntries(vocabModels);
        return vocabModels
    }

    /**
     * Loads and save safari history to chrome storage.
     * 
     * @param {string} safariJSON - safari history json data
     * @returns {Promise<VocabEntry[]>} A promise that resolves to an array of vocab models.
     */
    static async ingest(safariJSON) {
        console.log("Loaded Safari JSON: ", safariJSON);
        const safariURLHistory = this.#convertSafariHistory(safariJSON);
        console.log("URL History: ", safariURLHistory);
        const vocabModelsSaved = await this.#saveSafariHistory(safariURLHistory);
        console.log("Finished saving Safari history.");
        return vocabModelsSaved;
    }
}