let keywords = [];

document.addEventListener('DOMContentLoaded', function () {
    // clearKeywords();
    loadKeywords();
    console.log(chrome.storage.sync.get('keywords'));
    const inputElement = document.getElementById('add-keyword-input');
    inputElement.focus();
    document.getElementById('add-keyword-form').addEventListener('submit', function (event) {
        event.preventDefault();
        let keyword = document.getElementById('add-keyword-input').value;
        addKeyword(keyword);
        document.getElementById('add-keyword-input').value = '';
    });
});

function loadKeywords() {
    chrome.storage.sync.get('keywords', function (data) {
        if (data.keywords) {
            keywords = data.keywords;
        }
    });
}

function addKeyword(keyword) {
    keyword = keyword.trim().toLowerCase();

    if (keyword === '') {
        console.log('Cannot add an empty keyword.');
        return;
    }

    if (keywords.includes(keyword)) {
        console.log('This keyword is already in the list.');
        return;
    }

    keywords.push(keyword);
    chrome.storage.sync.set({ keywords: keywords }, function () {
        console.log('Keyword added to the list.');
    });
    console.log(chrome.storage.sync.get('keywords'));
}

function clearKeywords() {
    keywords = [];
    chrome.storage.sync.set({ keywords: keywords }, function () {
        console.log('Keywords list cleared.');
    });
}

