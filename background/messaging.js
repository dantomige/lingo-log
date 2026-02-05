import { handleLoadVocab, handleImportSafari } from "./orchestrator.js";
import { MESSAGE_TYPES } from "./messageTypes.js";

/**
 * Messaging Handler
 * 
 * Listens for messages from other parts of the extension and routes them to appropriate handlers.
 */

export function setupMessagingHandler() {
    chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
        if (request.type === MESSAGE_TYPES.LOAD_VOCAB) {
            handleLoadVocab(request.timestamp)
                .then(vocabModels => {
                    sendResponse({ success: true, data: vocabModels });
                })
                .catch(error => {
                    console.error("Error handling vocab searches:", error);
                    sendResponse({ success: false, error: error.message });
                });
            return true; // Indicates that the response will be sent asynchronously
        }

        else if (request.type === MESSAGE_TYPES.IMPORT_SAFARI) {
            handleImportSafari(request.payload.data)
                .then(vocabModels => {
                    sendResponse({ success: true, data: vocabModels });
                })
                .catch(error => {
                    console.error("Error handling vocab searches:", error);
                    sendResponse({ success: false, error: error.message });
                });
            return true; // Indicates that the response will be sent asynchronously
        }
    });
}