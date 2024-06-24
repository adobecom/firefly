let dictionary = {};
let fuse;

// Display the key in the results section
function displayKey(query) {
  const keys = dictionary[query.toLowerCase()];
  const resultDiv = document.getElementById('results');
  resultDiv.innerHTML = '';

  if (keys) {
    keys.forEach(key => {
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
    });
  } else {
    resultDiv.innerHTML = `<p>No key found for translation value "${query}".</p>`;
  }
}

// Handle search input and display autocomplete suggestions
function handleSearchInput() {
  const query = this.value.toLowerCase();
  const autocompleteList = document.getElementById('autocomplete-list');
  autocompleteList.innerHTML = '';

  if (query.length > 0) {
    const suggestions = fuse.search(query).map(result => result.item);

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
  } else {
    autocompleteList.classList.add('hidden');
  }
}

// Fetch data from the localization files
function fetchData(selectedLanguage) {
  fetch(`/localization/${selectedLanguage}.json`)
    .then((response) => response.json())
    .then((data) => {
      if (typeof data === 'object' && data !== null) {
        dictionary = Object.keys(data).reduce((acc, key) => {
          const value = data[key]?.toLowerCase(); 
          if (value) {
            const formattedKey = key.replace('@clio/playground:', '');
            if (!acc[value]) {
              acc[value] = [];
            }
            acc[value].push(formattedKey);
          }
          return acc;
        }, {});
      } else {
        dictionary = {};
      }

      const keys = Object.keys(dictionary);
      fuse = new Fuse(keys, { threshold: 0.3 });
      document.getElementById('search').addEventListener('input', handleSearchInput);
    })
    .catch((error) => console.error('Error fetching data:', error));
}



// Handle language change
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

// Get available languages
async function getLanguages() {
  try {
    const response = await fetch('/drafts/kunwar/languages.json');
    const data = await response.json();
    const languageSelect = document.getElementById('language');
    const locales = data.data.map(item => item.languages);
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
  } catch (error) {
    console.error('Error fetching languages:', error);
  }
}

getLanguages();
