const uniqueVideoIds = new Set();
const TITLE_SELECTOR = '#video-title';
const PARENT_SELECTOR = 'ytd-rich-item-renderer';
const THUMBNAIL_ANCHOR_SELECTOR = 'a#thumbnail';
const DEBOUNCE_TIME = 500;
const API_KEY = '';

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
  .checked {
    /* Vous pouvez ajouter des styles ici pour indiquer que la vidéo a été vérifiée */
  }
`);

function checkTitle(title, keywords) {
    for (const keyword of keywords) {
        if (title.toLowerCase().includes(keyword)) {
            return true;
        }
    }
    return false;
}

function checkDescription(description, keywords) {
    for (const keyword of keywords) {
        if (description.toLowerCase().includes(keyword)) {
            return true;
        }
    }
    return false;
}

function checkTags(tags, keywords) {
    if (!tags) {
        return false;
    }

    for (const keyword of keywords) {
        if (tags.some(tag => tag.toLowerCase().includes(keyword))) {
            return true;
        }
    }
    return false;
}

function isKeywordFounded(title, description, tags, keywords){
    if (checkTitle(title, keywords)) {
        return true;
    }

    if (checkDescription(description, keywords)) {
        return true;
    }

    if (checkTags(tags, keywords)) {
        return true;
    }

    return false;
}

function fetchVideoDetails(videoId) {
    const url = `https://www.googleapis.com/youtube/v3/videos?id=${videoId}&part=snippet&key=${API_KEY}`;

    return fetch(url)
        .then((response) => {
            if (!response.ok) {
                throw new Error('Network response was not ok');
            }
            return response.json();
        })
        .then((data) => {
            if (data.items.length > 0) {
                const snippet = data.items[0].snippet;
                return new Promise((resolve) => {
                    chrome.storage.sync.get("keywords", (items) => {
                        const keywords = items.keywords || [];
                        console.log(keywords);
                        const shouldBlur = isKeywordFounded(snippet.title, snippet.description, snippet.tags, keywords);
                        resolve({snippet, shouldBlur});
                    });
                });
            } else {
                console.warn('No video details found for videoId:', videoId);
            }
        })
        .catch((error) => {
            console.error('There was a problem with the fetch operation:', error);
        });
}

function collectVideoIds() {
    const titleElements = document.querySelectorAll(TITLE_SELECTOR);
    titleElements.forEach((titleElement) => {
        const parentElement = titleElement.closest(PARENT_SELECTOR);
        if (!parentElement || parentElement.classList.contains("checked")) {
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

            fetchVideoDetails(videoId).then(({snippet, shouldBlur}) => {
                if (!shouldBlur) {
                    parentElement.classList.remove("blurred");
                } else {
                    console.log(snippet.title);
                    console.log(snippet.description);
                    console.log(snippet.tag);
                }
                parentElement.classList.add("checked");
            });

            // Requête API
            // fetchVideoDetails(videoId).then(value => {
            //     const keywords = chrome.storage.sync.get('keywords');
            //     console.log(keywords);
            //     // console.log(value.title);
            //     // console.log(value);
            //     // Vérifiez les conditions pour supprimer la classe 'blurred'
            //     if (isKeywordFounded(value.title, value.description, value.tags, keywords)){
            //         parentElement.classList.add('blurred');
            //         parentElement.classList.add("checked");
            //         return;
            //     }
            //     // Si les conditions sont remplies, supprimez la classe 'blurred' pour le parentElement
            //     // parentElement.classList.remove('blurred');
            //     parentElement.classList.add("checked");
            // });
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
