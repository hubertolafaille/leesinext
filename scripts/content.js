const uniqueVideoIds = new Set();
const TITLE_SELECTOR = '#video-title';
const PARENT_SELECTOR = 'ytd-rich-item-renderer';
const THUMBNAIL_ANCHOR_SELECTOR = 'a#thumbnail';
const DEBOUNCE_TIME = 500;

function injectStyles(css) {
    const style = document.createElement('style');
    style.textContent = css;
    document.head.appendChild(style);
}

injectStyles(`
  .blurred {
    filter: blur(30px);
    transition: filter 0.3s ease-in-out;
  }
`);

function collectVideoIds() {
    const titleElements = document.querySelectorAll(TITLE_SELECTOR);
    titleElements.forEach((titleElement) => {
        const parentElement = titleElement.closest(PARENT_SELECTOR);
        if (!parentElement) {
            console.warn("No parent element found");
            return;
        }

        // Ajouter la classe 'blurred' aux éléments ytd-rich-item-renderer
        parentElement.classList.add('blurred');

        const thumbnailAnchor = parentElement.querySelector(THUMBNAIL_ANCHOR_SELECTOR);
        if (!thumbnailAnchor) {
            console.warn("No thumbnail anchor element found");
            return;
        }

        const searchParams = new URLSearchParams(thumbnailAnchor.search);
        const videoId = searchParams.get('v');

        if (!uniqueVideoIds.has(videoId)) {
            uniqueVideoIds.add(videoId);
            console.log(`ID: ${videoId}`);
        }
    });
}

function debounce(func, wait) {
    let timeout;
    return function (...args) {
        clearTimeout(timeout);
        timeout = setTimeout(() => func.apply(this, args), wait);
    };
}

function observeDOM() {
    const targetNode = document.querySelector('ytd-app');
    const isHomepage = window.location.pathname === '/';

    if (!targetNode || !isHomepage) {
        setTimeout(observeDOM, 500);
        return;
    }

    const debouncedCollectVideoIds = debounce(collectVideoIds, DEBOUNCE_TIME);

    const observer = new MutationObserver((mutationsList) => {
        for (const mutation of mutationsList) {
            if (mutation.type === 'childList') {
                debouncedCollectVideoIds();
            }
        }
    });

    observer.observe(targetNode, { childList: true, subtree: true });
}

observeDOM();
