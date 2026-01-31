const btn = document.getElementById("review-words-button");

btn.addEventListener("click", function() {
    chrome.tabs.create({ url: "index.html" });
});