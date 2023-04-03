const uniqueVideoIds = new Set();

function changeVideoTitles() {
    const titleElements = document.querySelectorAll('#video-title');
    titleElements.forEach((titleElement) => {
        const parentElement = titleElement.closest('ytd-rich-item-renderer');
        if (!parentElement) {
            console.warn("No parent element found");
            return;
        }

        const thumbnailAnchor = parentElement.querySelector('a#thumbnail');
        if (!thumbnailAnchor) {
            console.warn("No thumbnail anchor element found");
            return;
        }

        const videoId = thumbnailAnchor.getAttribute('href').split('watch?v=')[1];

        if (!uniqueVideoIds.has(videoId)) {
            uniqueVideoIds.add(videoId);
            console.log(`ID: ${videoId}`);
        }
    });
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
