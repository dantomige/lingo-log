import { handleLoadVocab } from './orchestrator.js';


export function setupLifecycleHandler() {
    chrome.runtime.onInstalled.addListener(async (details) => {
        console.log(`Extension installed/updated. Reason: ${details.reason}`);
        try {
            const newSyncTime = Date.now()
            await bootUpVocabWords(newSyncTime);
            console.log("Initial vocab boot-up complete.");
        } catch (error) {
            console.error("Boot-up failed:", error);
        }
    });
}

async function bootUpVocabWords(newSyncTime) {
    return await handleLoadVocab(newSyncTime);
};