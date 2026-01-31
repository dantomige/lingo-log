const btn = document.getElementById("get-history-button");

btn.addEventListener("click", function() {
    chrome.history.search({ text: '', maxResults: 10 }, function(data) {
        const wordList = document.getElementById("word-list");
        data.forEach(function(page) {
            const p = document.createElement("p");
            p.textContent = page.url;
            wordList.appendChild(p);
        });
        wordList.style.color = "blue";
    });
});