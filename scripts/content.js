const uniqueVideoTitles = new Set();

function changeVideoTitles() {
    const titleElements = document.querySelectorAll('#video-title');
    titleElements.forEach((titleElement) => {
        let title = titleElement.textContent.trim();
        if (title.toLowerCase().includes('reaction')) {
            titleElement.textContent = displayedSpoilWarningTitle('reaction');
        }
        if (!uniqueVideoTitles.has(title)) {
            uniqueVideoTitles.add(title);
            console.log(title);
        }
    });
}

function displayedSpoilWarningTitle(keyword){
    return 'Attention spoil potentiel pour : '+ keyword;
}

function observeDOM() {
    const targetNode = document.querySelector('ytd-app');
    if (!targetNode) {
        setTimeout(observeDOM, 500);
        return;
    }

    const observer = new MutationObserver((mutationsList) => {
        for (const mutation of mutationsList) {
            if (mutation.type === 'childList') {
                changeVideoTitles();
            }
        }
    });

    observer.observe(targetNode, { childList: true, subtree: true });
}

observeDOM();






