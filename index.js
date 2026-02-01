LARGEST_INTEGER = 2147483647;

const btn = document.getElementById("get-history-button");


btn.addEventListener("click", async () => {

    // Fetch browsing history using Chrome API
    const history = await fetchHistory(LARGEST_INTEGER);
    console.log("Fetched history length:", history.length);
    
    // Filter for Google Search history
    const searchHistory = filterForSearchHistory(history);

    // Collect search inputs from Google Search URLs
    const googleSearchInputs = getGoogleSearchInputs(searchHistory);

    // Filter for vocabulary-related queries
    const VOCAB_KEYWORDS = ["define", "definition", "meaning", "synonym", "antonym", "etymology", "usage"];
    const vocabSearchInputs = filterForVocabularyQueries(googleSearchInputs, VOCAB_KEYWORDS);

    // Get vocabulary words from vocabulary-related queries
    const vocabWords = getVocabularyWords(vocabSearchInputs);
    // console.log("Vocabulary words extracted:", vocabWords);
    // console.log("Number of vocabulary words extracted:", vocabWords.length);

    // Fetch definitions for vocabulary words
    const wordDefinitions = await getInfoForWords(vocabWords);
    console.log("Word definitions fetched:", wordDefinitions);
    console.log("Number of unique vocabulary words with definitions:", Object.keys(wordDefinitions).length);

    // Render the vocabulary search inputs to the UI
    renderDefinitions(wordDefinitions);
});


async function fetchHistory(numResults) {
    return new Promise((resolve) => {
        chrome.history.search({ 
            text: '', 
            maxResults: numResults, 
            startTime: 0 
        }, resolve);
    });
};

function isActualSearch(historyItem) {
    const url = new URL(historyItem.url);

    const isGoogle = url.hostname.includes("google.com");
    const isSearchPage = url.pathname.includes("/search");
    const hasQuery = url.searchParams.has('q');

    return isGoogle && isSearchPage && hasQuery;
}

function filterForSearchHistory(history) {
    const searchHistory = history.filter(historyItem => isActualSearch(historyItem));
    return searchHistory;
};

function getGoogleSearchInputs(searchHistory) {
    const googleSearchInputs = searchHistory.map(historyItem => {
        const url = new URL(historyItem.url);
        const searchInput = url.searchParams.get("q");
        return searchInput;
    });
    return googleSearchInputs;
};

function filterForVocabularyQueries(googleSearchInputs, keywords) {
    
    const vocabSearchInputs = googleSearchInputs.filter(input => {
        for (let keyword of keywords) {
            if (input.toLowerCase().includes(keyword.toLowerCase())) {
                return true;
            }
        }
        return false;
    });

    return vocabSearchInputs;
}

function getVocabularyWords(vocabSearchInputs) {
    const vocabWords = vocabSearchInputs.map(query => {
    return query
        .replace(/\b(definition|meaning|synonym|etymology|define|what is|in english|french|spanish|yoruba)\b/gi, '')
        .replace(/[0-9]+\./g, '')
        .trim();
    });
    return vocabWords;
}

async function fetchWordData(word) {
    try {
        const response = await fetch(`https://api.dictionaryapi.dev/api/v2/entries/en/${word}`);
        const wordData = await response.json();
        console.log(`Fetched data for ${word}:`, wordData);
        return wordData;
    } catch (error) {
        console.error(`Error fetching data for ${word}:`, error);
        return null;
    }
}

async function getInfoForWords(words) {
    const wordDefinitions = {};

    const allWordDataPromises = words.map(word => fetchWordData(word));
    const allWordDataResults = await Promise.allSettled(allWordDataPromises);
    const successfulWordData = allWordDataResults
        .filter(r => r.status === "fulfilled")
        .map(r => r.value);

    console.log("Successful word data fetched:", successfulWordData, "Total successful:", successfulWordData.length);

    for (let wordData of successfulWordData) {
        try {
            const word = wordData[0].word;
            const meanings = wordData[0].meanings;

            console.log(`typeof meanings: ${typeof meanings}, length: ${meanings.length}, data:`, meanings);

            const mostFrequentMeaning = meanings[0]

            const partofSpeech = mostFrequentMeaning.partOfSpeech

            const definitions = mostFrequentMeaning.definitions
            const definition = definitions[0].definition

            const example = definitions[0].example

            if (!(word in wordDefinitions)) {
                wordDefinitions[word] = {"definition": definition, "partOfSpeech": partofSpeech, "count": 0, "example": example};
                console.log(`Added new word definition for ${word}`, wordDefinitions[word], Object.keys(wordDefinitions).length);
            } 

            wordDefinitions[word].count += 1;
        } catch (error) {
            console.error(`Error processing word data:`, error);
            continue;
        }
    }

    return wordDefinitions;
}

function renderDefinitions(wordDefinitions) {
    const wordList = document.getElementById("word-list");
    const numWords = Object.keys(wordDefinitions).length;
    const header = document.createElement("h2");
    header.textContent = `You have looked up ${numWords} vocabulary-related terms:`;
    wordList.appendChild(header);

    let index = 1;
    for (const [word, definitionData] of Object.entries(wordDefinitions)) {
        const container = document.createElement("div");
        container.className = "word-item";
        container.style.marginBottom = "15px";

        container.innerHTML = `
            <div style="color: blue; font-weight: bold;">
                ${index}. ${word.toUpperCase()} 
                <span style="color: gray; font-style: italic;">(${definitionData.partOfSpeech || 'N/A'})</span>
            </div>
            <div style="margin-left: 15px;">
                <strong>Def:</strong> ${definitionData.definition} <br>
                <strong>Ex:</strong> "<em>${definitionData.example || 'No example available'}</em>" <br>
                <small>Looked up: ${definitionData.count} ${definitionData.count === 1 ? 'time' : 'times'}</small>
            </div>
        `;

        wordList.appendChild(container);
        index++;
    }
};

function render(userInputs) {
    const wordList = document.getElementById("word-list");
    const inputCount = userInputs.length;
    const header = document.createElement("h2");
    header.textContent = `You have looked up ${inputCount} vocabulary-related terms:`;
    wordList.appendChild(header);

    for ([index, userInput] of userInputs.entries()) {
        const p = document.createElement("p");
        p.textContent = `${index + 1}. ${userInput}`;
        p.style.color = "blue";
        wordList.appendChild(p);
    }
};