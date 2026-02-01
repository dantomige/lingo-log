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

    // Render the vocabulary search inputs to the UI
    render(vocabSearchInputs);
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