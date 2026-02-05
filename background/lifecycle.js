import { handleLoadVocab } from './orchestrator.js';
import { VocabStorage } from '../storage.js';


export function setupLifecycleHandler() {
    chrome.runtime.onInstalled.addListener(async (details) => {
        console.log(`Extension installed/updated. Reason: ${details.reason}`);
        
        if (details.reason === chrome.runtime.OnInstalledReason.INSTALL) {
            try {
                const newSyncTime = Date.now()
                await handleVocabWordsOnInstall(newSyncTime);
                console.log("Initial vocab boot-up complete.");
            } catch (error) {
                console.error("Boot-up failed:", error);
            };
        }

        else if (details.reason === chrome.runtime.OnInstalledReason.UPDATE) {
            console.log(`Extension updates. No changes made.`);
        }
    });
}

async function handleVocabWordsOnInstall(newSyncTime) {
    await VocabStorage.clearAllVocabEntries();
    return await handleLoadVocab(newSyncTime);
};