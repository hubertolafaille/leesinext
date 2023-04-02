document.addEventListener('DOMContentLoaded', function() {
    const inputElement = document.getElementById('add-keyword-input');
    inputElement.focus();
});

document.getElementById('add-keyword-form').addEventListener('submit', function(event) {
    event.preventDefault();
    let keyword = document.getElementById('add-keyword-input').value;
    displayKeyword(keyword);
    document.getElementById('add-keyword-input').value = '';
});

function displayKeyword(keyword) {
    let displayArea = document.createElement('div');
    displayArea.innerText = keyword;
    document.body.appendChild(displayArea);
}
