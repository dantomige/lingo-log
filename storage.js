import { VocabEntry } from "./vocabModel.js";

/**
 * Adaptor for saving and loading vocabulary entries to/from localStorage.
 */

export class VocabStorage {

    static #toSchema(vocabEntry) {
        return {
            definition: vocabEntry.definition,
            partOfSpeech: vocabEntry.partOfSpeech,
            example: vocabEntry.example,
            count: vocabEntry.count
        };
    }

    static #fromSchema(word, schema) {
        return new VocabEntry(
            word,
            schema.definition,
            schema.partOfSpeech,
            schema.example,
            schema.count
        );
    }

    /**
     * Saves the storage with new vocabulary entries. If there are existing entries, the action fails
     * without changing the storage. Multiple examples of the same word in vocabEntries are not allowed and causes failure.
     * 
     * @param {VocabEntry[]} vocabEntries - Array of VocabEntry objects to save
     * @returns {Promise<void>}
     * @throws {Error} If any of the vocab entries already exist in storage
     */
    static async saveVocabEntries(vocabEntries) {
        const allExistingVocabEntries = await chrome.storage.local.get(null);
        const seenWords = new Set(Object.keys(allExistingVocabEntries));
        
        // If any word already exists, throw error
        for (let vocabEntry of vocabEntries) {
            if (seenWords.has(vocabEntry.word)) {
                throw new Error(`Word ${vocabEntry.word} already exists in storage.`);
            }
        }

        // Create storage input format while checking for duplicates in input vocabEntries
        const storageInputMap = {};
        for (const vocabEntry of vocabEntries) {
            if (storageInputMap[vocabEntry.word]) {
                throw new Error(`Duplicate word ${vocabEntry.word} in input vocab entries.`);
            }
            storageInputMap[vocabEntry.word] = VocabStorage.#toSchema(vocabEntry);
        }

        await chrome.storage.local.set(storageInputMap);

        return;
    }

    /**
     * Updates the storage with new vocabulary entries. Existing entries are incremented
     * by VocabEntry.count if they already exist in the storage. Multiple elements of the same word will have their counts summed.
     * 
     * @param {VocabEntry[]} vocabEntries - Array of VocabEntry objects to save
     * @returns {Promise<void>}
     */
    static async updateVocabEntries(vocabEntries) {

        // Load existing entries to check for duplicates
        const allExistingVocabEntries = await chrome.storage.local.get(null);
        const seenWords = new Set(Object.keys(allExistingVocabEntries));

        // Collapse all examples of the same word in vocabEntries
        const collapsedVocabEntries = new Map();
        for (const vocabEntry of vocabEntries) {
            if (collapsedVocabEntries.has(vocabEntry.word)) {
                const existingEntry = collapsedVocabEntries.get(vocabEntry.word);
                existingEntry.incrementCount(vocabEntry.count);
            }
            else {
                collapsedVocabEntries.set(vocabEntry.word, vocabEntry);
            }
        }
        vocabEntries = Array.from(collapsedVocabEntries.values());

        // Update counts with existing entries
        for (let vocabEntry of vocabEntries) {
            if (seenWords.has(vocabEntry.word)) {
                // console.log(`Word ${vocabEntry.word} already exists in storage. Incrementing count.`);
                const existingEntry = allExistingVocabEntries[vocabEntry.word];
                vocabEntry.incrementCount(existingEntry.count);
            }
        }

        // Convert to storage input format
        const storageInputMap = vocabEntries.reduce((map, vocabEntry) => {
            map[vocabEntry.word] = VocabStorage.#toSchema(vocabEntry);
            return map;
        }, {});

        console.log("Updating vocab entries in storage:", storageInputMap);

        await chrome.storage.local.set(storageInputMap);

        return;
    }

    /**
     * Loads all vocabulary entries from localStorage.
     * 
     * @returns {Promise<VocabEntry[]>} - Array of VocabEntry objects loaded from storage
     */
    static async loadAllVocabEntries() {
        const allVocabEntries = await chrome.storage.local.get(null);

        return Object.entries(allVocabEntries).map(([word, schema]) => {
            return VocabStorage.#fromSchema(word, schema);
        });
    }

    static async clearAllVocabEntries() {
        await chrome.storage.local.clear();
    }

    static async saveLastSyncTime(timestamp) {
        console.log("Setting last sync time :", {timestamp});
        await chrome.storage.sync.set({ lastSyncTime: timestamp });
    }

    static async loadLastSyncTime() {
        const result = await chrome.storage.sync.get("lastSyncTime");
        return result["lastSyncTime"] || 0;
    }
};