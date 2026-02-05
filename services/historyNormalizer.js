/**
 * 
 * Converts list of chrome history items to list of url items
 * 
 * @param {chrome.history.HistoryItem[]} chromeHistory - chrome search history
 * @returns {URL[]} - chrome history urls
 */
function normalizeChromeHistory(chromeHistory) {
    return chromeHistory.map((historyItem) => new URL(historyItem.url))
}