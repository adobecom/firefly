let dictionary = {};

function getLanguages() {
  fetch('/localization/lang-store.json')
    .then((response) => response.json())
    .then((data) => {
      const languageSelect = document.getElementById('language');
      const locales = data[':names'];
      languageSelect.innerHTML = '';

      locales.forEach((locale) => {
        const option = document.createElement('option');
        option.value = locale;
        option.textContent = locale;
        if (locale === 'en-US') {
          option.selected = true; // Set en-US as the default selected language
        }
        languageSelect.appendChild(option);
      });

      const defaultLanguage = languageSelect.value;
      fetchData(defaultLanguage);
      document.getElementById('language').addEventListener('change', handleLanguageChange);
    })
    .catch((error) => console.error('Error fetching languages:', error));
}

function displayKey(query) {
  const key = dictionary[query];
  const resultDiv = document.getElementById('results');
  resultDiv.innerHTML = '';

  if (key) {
    const keyContainer = document.createElement('div');
    keyContainer.classList.add('key-container');
    keyContainer.textContent = `$${key}`;

    const copyButton = document.createElement('button');
    copyButton.classList.add('copy-button');
    copyButton.textContent = 'Copy';
    copyButton.addEventListener('click', () => {
      const copyText = document.createElement('textarea');
      copyText.value = `$${key}`;
      document.body.appendChild(copyText);
      copyText.select();
      document.execCommand('copy');
      document.body.removeChild(copyText);
    });

    keyContainer.appendChild(copyButton);
    resultDiv.appendChild(keyContainer);
  } else {
    resultDiv.innerHTML = `<p>No key found for translation value "${query}".</p>`;
  }
}

function handleSearchInput() {
  const query = this.value.toLowerCase();
  const suggestions = Object.keys(dictionary).filter((value) => value.includes(query));
  const autocompleteList = document.getElementById('autocomplete-list');
  autocompleteList.innerHTML = '';

  if (suggestions.length > 0) {
    autocompleteList.classList.remove('hidden');
    suggestions.forEach((suggestion) => {
      const div = document.createElement('div');
      div.classList.add('autocomplete-suggestion');
      div.textContent = suggestion;
      div.addEventListener('click', () => {
        document.getElementById('search').value = suggestion;
        autocompleteList.innerHTML = '';
        autocompleteList.classList.add('hidden');
        displayKey(suggestion);
      });
      autocompleteList.appendChild(div);
    });
  } else {
    autocompleteList.classList.add('hidden');
  }
}

function fetchData(selectedLanguage) {
  fetch(`/localization/lang-store.json?sheet=${selectedLanguage}`)
    .then((response) => response.json())
    .then((data) => {
      dictionary = data.data.reduce((acc, item) => {
        acc[item[selectedLanguage].toLowerCase()] = item.key;
        return acc;
      }, {});
      document.getElementById('search').addEventListener('input', handleSearchInput);
    })
    .catch((error) => console.error('Error fetching data:', error));
}

function handleLanguageChange() {
  const selectedLanguage = document.getElementById('language').value;
  const searchInput = document.getElementById('search');
  const autocompleteList = document.getElementById('autocomplete-list');
  const resultsSection = document.getElementById('results');

  searchInput.value = '';
  autocompleteList.classList.add('hidden');
  resultsSection.innerHTML = '';

  fetchData(selectedLanguage);
}

getLanguages();
