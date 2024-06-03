/* eslint-disable no-console */
/*
 * Copyright 2022 Adobe. All rights reserved.
 * This file is licensed to you under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License. You may obtain a copy
 * of the License at http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software distributed under
 * the License is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR REPRESENTATIONS
 * OF ANY KIND, either express or implied. See the License for the specific language
 * governing permissions and limitations under the License.
 */

import { setLibs, decorateArea } from './utils.js';
import { openModal } from '../blocks/modal/modal.js';

// Add project-wide style path here.
const STYLES = '/styles/styles.css';

// Use 'https://milo.adobe.com/libs' if you cannot map '/libs' to milo's origin.
const LIBS = '/libs';

// Add any config options.
const CONFIG = {
  // codeRoot: '',
  // contentRoot: '',
  imsClientId: 'firefly-milo',
  imsScope: 'AdobeID,openid,gnav',
  geoRouting: 'off',
  fallbackRouting: 'off',
  decorateArea,
  locales: {
    '': { ietf: 'en-US', tk: 'hah7vzn.css' },
    de: { ietf: 'de-DE', tk: 'hah7vzn.css' },
    kr: { ietf: 'ko-KR', tk: 'zfo3ouc' },
  },
};

// Decorate the page with site specific needs.
// decorateArea();

/*
 * ------------------------------------------------------------
 * Edit below at your own risk
 * ------------------------------------------------------------
 */

const miloLibs = setLibs(LIBS);

(function loadStyles() {
  const paths = [`${miloLibs}/styles/styles.css`];
  if (STYLES) { paths.push(STYLES); }
  paths.forEach((path) => {
    const link = document.createElement('link');
    link.setAttribute('rel', 'stylesheet');
    link.setAttribute('href', path);
    document.head.appendChild(link);
  });
}());

async function loadProfile() {
  if (!window.adobeIMS) return;
  const authToken = window.adobeIMS.getAccessToken()?.token;
  if (!authToken) return;
  const url = 'https://uds.adobe-identity.com/userdocs/firefly-web';
  const headers = new Headers({
    'x-api-key': 'clio-playground-web',
    Authorization: `Bearer ${authToken}`,
  });
  const resp = await fetch(url, {
    headers,
    mode: 'cors',
  });
  if (resp.ok) {
    const profile = await resp.json();
    if (!profile.data['whats-new-dialog-confirmed']) {
      await openModal('/fragments/whatsnew');
    }
  }
}

async function headerModal() {
  const links = document.querySelectorAll('a[href*="/fragments/"]');
  if (!links || (links.length === 0)) return;
  links.forEach((link) => {
    // eslint-disable-next-line no-unused-vars
    link.addEventListener('click', async (e) => {
      e.preventDefault();
      await openModal(link.href);
    });
  });
}

// Fetch locale from cookie
export function getLocaleFromCookie() {
  const match = document.cookie.match(/(^| )locale=([^;]+)/);
  if (match) {
    return match[2];
  }
  return null;
}

// Process i18n text
const langStoreCache = {
  cache: null,

  async fetchLangStoreData(locale, limit) {
    const resp = await fetch(`/drafts/kunwar/lang-store.json?limit=${limit}&sheet=${locale}`);
    if (resp.ok) {
      const json = await resp.json();
      this.cache = json.data;
      return this.cache;
    }
    return [];
  },

  async getData(locale, limit) {
    return this.cache || this.fetchLangStoreData(locale, limit);
  },

  async getValueByKey(key, locale, limit) {
    const data = await this.getData(locale, limit);
    const langEntry = data.find((entry) => entry.key === key);
    return langEntry?.[locale] ?? null;
  },
};

const processText = (text, langStoreData, locale) => text.replace(/\$[a-zA-Z0-9_-]+/g, (match) => {
  const jsonKey = match.slice(1);
  const data = langStoreData.find((entry) => entry.key === jsonKey);
  return data?.[locale] ?? match;
});

// Decorate i18n text
export async function decorateI18n(block) {
  const locale = getLocaleFromCookie() || 'en-US';
  const limit = 5000;

  // Check & Fetch language store data if not already cached
  const langStoreData = await langStoreCache.getData(locale, limit);

  // Process single <code> elements not inside <pre>
  block.querySelectorAll('code').forEach((el) => {
    if (!el.closest('pre')) { // Skip <code> inside <pre>
      const text = el.textContent.trim();
      const newText = processText(text, langStoreData, locale);
      const textNode = document.createTextNode(newText);
      el.parentNode.replaceChild(textNode, el);
    }
  });

  // Process multi-line <code> blocks wrapped in <pre>
  block.querySelectorAll('pre code').forEach((el) => {
    const text = el.textContent.trim();
    const keys = text.split(/\s+/);
    const newTexts = keys.map((key) => {
      const newText = processText(key, langStoreData, locale);
      return `<p>${newText}</p>`;
    });
    el.parentNode.outerHTML = newTexts.join('');
  });
}

// Function to fetch value for a specific key
export async function getI18nValue(key, limit = 5000) {
  try {
    const locale = getLocaleFromCookie() || 'en-US';
    const value = await langStoreCache.getValueByKey(key, locale, limit);
    return value ?? key;
  } catch (error) {
    console.error(`Error fetching i18n value for key: ${key}`, error);
    return key;
  }
}

async function loadPage() {
  // eslint-disable-next-line no-unused-vars
  const { loadArea, setConfig, loadMartech } = await import(`${miloLibs}/utils/utils.js`);
  // eslint-disable-next-line no-unused-vars
  const config = setConfig({ ...CONFIG, miloLibs });
  await decorateI18n(document.querySelector('main'));
  await loadArea();
  await headerModal();
  setTimeout(() => {
    loadMartech();
    loadProfile();
  }, 3000);
}

loadPage();

(async function livePreview() {
  const preview = new URL(window.location.href).searchParams.get('dapreview');
  if (!preview) return;
  const origin = preview === 'local' ? 'http://localhost:3000' : 'https://da.live';
  import(`${origin}/scripts/dapreview.js`).then(({ default: daPreview }) => daPreview(loadPage));
}());
