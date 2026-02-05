import { VocabStorage } from '../storage.js';
import { HistoryProvider } from '../services/historyProvider.js';
import { normalizeChromeHistory } from '../services/historyNormalizer.js'
import { VocabFilterEngine } from '../services/vocabFilterEngine.js';
import { DictionaryService } from '../services/dictionaryService.js';

/**
 * 
 * Orchestrator to handle the end-to-end flow of fetching vocab searches from history
 * 
 * @returns {Promise<VocabEntry[]>} A promise that resolves to an array of vocab models.
 */
export async function handleLoadVocab(newSyncTime) {
    // Get the last sync time indicating what poi
    const lastSyncTime = await VocabStorage.loadLastSyncTime();

    // Fetch recent vocab history since last sync time and create models
    const recentHistory =  await HistoryProvider.fetchHistory(lastSyncTime, newSyncTime);
    console.log("Recent history: ", recentHistory);
    const urlHistory = normalizeChromeHistory(recentHistory);
    console.log("urlHistory: ", urlHistory);
    const vocabSearchTerms = VocabFilterEngine.extractVocab(urlHistory);
    console.log("Vocab search terms: ", vocabSearchTerms);
    const vocabModels = await DictionaryService.fetchDetailsBatch(vocabSearchTerms);
    console.log("Vocab models: ", vocabModels);

    await VocabStorage.updateVocabEntries(vocabModels);
    await VocabStorage.saveLastSyncTime(newSyncTime);

    const allVocabModels = await VocabStorage.loadAllVocabEntries();
    console.log("All models: ", allVocabModels);

    return allVocabModels;
}