/**
 * Adaptor for saving and loading vocabulary entries to/from localStorage.
 */

class VocabStorage {

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
     * Updates the storage with new vocabulary entries. Existing entries are incremented
     * by VocabEntry.count if they already exist in the storage.
     * 
     * @param {VocabEntry[]} vocabEntries - Array of VocabEntry objects to save
     * @returns {Promise<void>}
     */
    static async saveVocabEntries(vocabEntries) {
        const allVocabEntries = chrome.storage.local.get(null);

        await allVocabEntries;
        // console.log(typeof allVocabEntries, allVocabEntries);
        // console.log("Keys:", Object.keys(allVocabEntries), "Total keys:", Object.keys(allVocabEntries).length);
        const seenWords = new Set(Object.keys(allVocabEntries));
        console.log("Seen words in storage:", seenWords, "Total seen words:", seenWords.size);
        
        for (let vocabEntry of vocabEntries) {
            if (seenWords.has(vocabEntry.word)) {
                const existingEntry = allVocabEntries[vocabEntry.word];
                vocabEntry.incrementCount(existingEntry.count);
            }
        }

        const storageInputMap = vocabEntries.reduce((map, vocabEntry) => {
            map[vocabEntry.word] = VocabStorage.#toSchema(vocabEntry);
            return map;
        }, {});

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
        await chrome.storage.sync.set({ lastSyncTime: timestamp });
    }

    static async loadLastSyncTime() {
        const result = await chrome.storage.sync.get("lastSyncTime");
        return result["lastSyncTime"] || 0;
    }
}