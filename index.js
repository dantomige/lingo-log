const btn = document.getElementById("get-history-button");


btn.addEventListener("click", async () => {
    const history = await fetchHistory(100);
    // console.log("After fetching history", typeof history, history);
    const searchHistory = filterforSearchHistory(history);
    // console.log("After filtering for search history", typeof searchHistory, searchHistory);
    const googleSearchInputs = getGoogleSearchInputs(searchHistory);
    // console.log("After extracting Google search inputs", typeof googleSearchInputs, googleSearchInputs);
    renderGoogleSearchInputs(googleSearchInputs);
});


async function fetchHistory(numResults) {
    return new Promise((resolve) => {
        chrome.history.search({ text: '', maxResults: numResults }, function(chromeHistory) {
            resolve(chromeHistory);
        });
    });
};

function isActualSearch(historyItem) {
    const url = new URL(historyItem.url);

    const isGoogle = url.hostname.includes("google.com");
    const isSearchPage = url.pathname.includes("/search");
    const hasQuery = url.searchParams.has('q');

    return isGoogle && isSearchPage && hasQuery;
}

function filterforSearchHistory(history) {
    const searchHistory = history.filter(historyItem => isActualSearch(historyItem));
    return searchHistory;
};

function getGoogleSearchInputs(searchHistory) {
    const googleSearchInputs = searchHistory.map(historyItem => {
        const url = new URL(historyItem.url);
        const searchInput = url.searchParams.get("q");
        console.log("Google search query:", searchInput);
        return searchInput;
    });
    return googleSearchInputs;
};

function renderGoogleSearchInputs(googleSearchInputs) {
    const wordList = document.getElementById("word-list");

    googleSearchInputs.forEach(function(userInput) {
        const p = document.createElement("p");
        p.textContent = userInput;
        wordList.appendChild(p);
    });

    wordList.style.color = "blue";
};