import { MESSAGE_TYPES } from "./background/messageTypes.js";
import { VocabEntry } from "./vocabModel.js";

const btn = document.getElementById("get-history-button");

btn.addEventListener("click", async () => {

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

/**
 * 
 * Renders all vocab words to index page.
 * 
 * @param {VocabEntry[]} allVocabEntries - All the vocabularies words (and their associated data) looked up by the user
 */
function renderDefinitions(allVocabEntries) {
    const wordList = document.getElementById("word-list");
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