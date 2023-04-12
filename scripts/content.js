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

function checkTitle(title) {
    if (title.includes('z')){
        console.log(title);
        return true;
    }
    return false;
}

function checkDescription(description) {
    return false;
}

function checkTags(tags) {
    return false;
}

function isKeywordFounded(title, description, tags){
    if (checkTitle(title)) {
        return true;
    }

    if (checkDescription(description)) {
        return true;
    }

    if (checkTags(tags)) {
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
                // console.log(snippet);
                // Vérifiez les détails de la vidéo et déterminez si vous souhaitez supprimer la classe 'blurred'
                return snippet;
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

            // Requête API
            fetchVideoDetails(videoId).then(value => {
                // console.log(value.title);
                // console.log(value);
                // Vérifiez les conditions pour supprimer la classe 'blurred'
                if (isKeywordFounded(value.title, value.description, value.tags)){
                    parentElement.classList.add("checked");
                    return;
                }
                // Si les conditions sont remplies, supprimez la classe 'blurred' pour le parentElement
                parentElement.classList.remove('blurred');
                parentElement.classList.add("checked");
            });
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
