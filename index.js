import { MESSAGE_TYPES } from "./background/messageTypes.js";
import { VocabEntry } from "./models/vocabModel.js";

const loadButton = document.getElementById("get-history-button");
const importButton = document.getElementById("import-safari-button");
const fileInput = document.getElementById("safari-file-input");

loadButton.addEventListener("click", async () => {

    // Collect vocab history (send message to service worker)
    const response = await chrome.runtime.sendMessage(
        {
            type: MESSAGE_TYPES.LOAD_VOCAB,
            payload: {},
            timestamp: Date.now()
        }
    )

    if (!response.success) {
        throw new Error(`Failed to load vocab data. Error: ${response.error}`);
    }
    
    const allVocabEntries = response.data;

    // Render the vocabulary search inputs to the UI
    renderDefinitions(allVocabEntries);
});

importButton.addEventListener("click", async () => {
    fileInput.click();
});

fileInput.addEventListener("change", async () => {
    const file = event.target.files[0]; // Get the first selected file
    
    if (!file) return; // User cancelled the selection

    const reader = new FileReader();

    reader.onload = async (e) => {

        // 1. Shut off button and prepare data
        const originalText = importButton.textContent;

        importButton.disabled = true;
        importButton.textContent = "Loading...";
        
        const fileContent = e.target.result; // This is the actual JSON text
        const jsonData = JSON.parse(fileContent);

        // 2. Send the ACTUAL DATA to your background script
        const response = await chrome.runtime.sendMessage({
            type: MESSAGE_TYPES.IMPORT_SAFARI,
            payload: { 
                data: jsonData, // Pass the object, not the filename
                filename: file.name 
            },
            timestamp: Date.now()
        });

        if (!response.success) {
            throw new Error(`Failed to load vocab data. Error: ${response.error}`);
        }

        // Update response
        const numVocabSearches = response.data.length;

        importButton.disabled = false;
        importButton.textContent = originalText;

        // Render the vocabulary search inputs to the UI
        renderSafariImportSummary(numVocabSearches);
    };

    reader.readAsText(file); // This triggers the 'onload' above
});

/**
 * Renamed from renderSafariImportResults
 * Displays a summary message in the UI
 */
function renderSafariImportSummary(count) {
    const safariSummaryContainer = document.getElementById("safari-summary-container");
    if (count !== null) {
        safariSummaryContainer.innerHTML = `
            <div class="import-banner success">
                <strong>Success!</strong> Imported ${count} new searches from Safari history.
            </div>
        `;
    } else {
        safariSummaryContainer.innerHTML = `
            <div class="import-banner success">
                <strong>Import Complete!</strong> Your Safari history has been synced.
            </div>
        `;
    }
}

/**
 * 
 * Renders all vocab words to index page.
 * 
 * @param {VocabEntry[]} allVocabEntries - All the vocabularies words (and their associated data) looked up by the user
 */
function renderDefinitions(allVocabEntries) {
    const wordList = document.getElementById("word-list");

    // clear html
    wordList.innerHTML = "";

    
    const numWords = allVocabEntries.length;
    const header = document.createElement("h2");
    header.textContent = `You have looked up ${numWords} vocabulary-related terms:`;
    wordList.appendChild(header);

    console.log(allVocabEntries);

    allVocabEntries.forEach((vocabEntry, index) => {
        const container = document.createElement("div");
        container.className = "word-item";
        container.style.marginBottom = "15px";

        container.innerHTML = `
            <div style="color: blue; font-weight: bold;">
                ${index + 1}. ${vocabEntry.word.toUpperCase()} 
                <span style="color: gray; font-style: italic;">(${vocabEntry.partOfSpeech || 'N/A'})</span>
            </div>
            <div style="margin-left: 15px;">
                <strong>Def:</strong> ${vocabEntry.definition} <br>
                <strong>Ex:</strong> "<em>${vocabEntry.example || 'No example available'}</em>" <br>
                <small>Looked up: ${vocabEntry.count} ${vocabEntry.count === 1 ? 'time' : 'times'}</small>
            </div>
        `;

        wordList.appendChild(container);
    });
};