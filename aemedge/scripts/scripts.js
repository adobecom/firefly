/* eslint-disable quote-props */
/* eslint-disable quotes */
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

// import { LitElement, html } from 'https://cdn.jsdelivr.net/gh/lit/dist@3/core/lit-core.min.js';
import { setLibs, decorateArea } from './utils.js';
import { openModal } from '../blocks/modal/modal.js';
import { loadScript } from './aem.js';

const searchParams = new URLSearchParams(window.location.search);

// Add project-wide style path here.
const STYLES = '/aemedge/styles/styles.css';

// Use 'https://milo.adobe.com/libs' if you cannot map '/libs' to milo's origin.
const LIBS = '/libs';

// Add any config options.
const CONFIG = {
  codeRoot: '/aemedge',
  // contentRoot: '',
  imsClientId: 'firefly-milo',
  imsScope: 'AdobeID,openid,gnav,pps.read,additional_info.roles,read_organizations',
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
    UDS_APP_DOMAIN: 'firefly-web',
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

async function preRedirectWork() {
  return new Promise((resolve) => {
    let progress = 0;
    const tick = () => {
      progress += 1;

      // eslint-disable-next-line consistent-return
      setTimeout(() => {
        if (progress < 3) {
          return tick();
        }
        progress = 0;
        resolve(null);
      }, 1000);
    };

    tick();
  });
}

const onAuthFailed = async (e) => {
  console.debug('onAuthFailed: ', JSON.stringify(e));
  if (e.detail.reason === 'popup-blocked') {
    const redirectUri = e.detail.fallbackUrl;
    await preRedirectWork.apply(this);
    window.location.assign(redirectUri);
  }
};

const onAuthCode = (e) => {
  console.debug('onAuthCode: ', JSON.stringify(e));
};

const onRedirect = async (e) => {
  const redirectUri = e.detail;
  await preRedirectWork.apply(this);
  window.location.assign(redirectUri);
};

const onToken = async () => {
  await window.adobeIMS.refreshToken();
  window.location.reload();
};

const onError = (e) => {
  console.log(`onError: e: ${e}`);
  if (e.detail.name === 'critical') {
    console.error('critical', e);
  }

  if (e.detail.name === 'unrecoverable') {
    console.error('unrecoverable', e);
  }
};

const onProviderClicked = (e) => {
  console.debug('provider clicked', e);
};

const onSentryLoad = (e) => {
  console.debug('susi-sentry loaded', e);
};

const onMessage = (e) => {
  console.debug('onMessage: ', e);
};

// override the signIn method from milo header and load SUSI Light
async function signInOverride() {
  try {
    const main = document.querySelector('main');
    const sentryWrapper = main.querySelector('.sentry-wrapper');
    if (sentryWrapper) {
      sentryWrapper.classList.remove('hidden');
    } else {
      const susiConfig = { 'consentProfile': 'adobe-id-sign-up' };
      const darkMode = window?.matchMedia('(prefers-color-scheme: dark)')?.matches || true;
      const susiAuthParams = {
        'client_id': CONFIG.imsClientId,
        'scope': CONFIG.imsScope,
        'locale': 'en-us',
        'response_type': 'token',
        'dt': darkMode,
        'redirect_uri': window.location.href,
      };
      if (searchParams.get('disable_local_msw') === 'true') {
        // eslint-disable-next-line dot-notation
        susiAuthParams['disable_local_msw'] = 'true';
      }

      const susiSentryTag = `<susi-sentry 
        id="sentry"
        variant="large-buttons"
        popup=true
        stage=true
      ></susi-sentry>`;

      const susiSentryDiv = document.createElement('div');
      susiSentryDiv.classList.add('sentry-wrapper');
      susiSentryDiv.innerHTML = susiSentryTag;
      const susiLightEl = susiSentryDiv.firstChild;
      susiLightEl.classList.add((darkMode === true) ? 'dark' : 'light');
      susiLightEl.config = susiConfig;
      susiLightEl.authParams = susiAuthParams;
      main.prepend(susiSentryDiv);
      // Register event listeners on susi-sentry
      susiLightEl.addEventListener('message', onMessage);
      susiLightEl.addEventListener('on-token', onToken);
      susiLightEl.addEventListener('on-auth-code', onAuthCode);
      susiLightEl.addEventListener('on-auth-failed', onAuthFailed);
      susiLightEl.addEventListener('on-error', onError);
      susiLightEl.addEventListener('on-load', onSentryLoad);
      susiLightEl.addEventListener('on-provider-clicked', onProviderClicked);
      susiLightEl.addEventListener('redirect', onRedirect);

      await loadScript('https://auth.services.adobe.com/imslib/imslib.min.js');
      // await loadScript('https://cdn.jsdelivr.net/gh/lit/dist@3/core/lit-core.min.js', { type: "module" });
      await loadScript('/aemedge/scripts/sentry/bundle.js', { type: "module" });
      window.addEventListener('click', (e) => {
        // if sign-in modal open and user clicks out of it, close the modal
        const isClickInsideModal = susiLightEl.contains(e.target);
        if (susiLightEl.checkVisibility() && !isClickInsideModal) susiSentryDiv.classList.add('hidden');
      });
    }
  } catch (e) {
    console.error(e);
  }
}

async function headerModal() {
  const links = document.querySelectorAll('a[href*="/fragments/"]');
  if (!links || (links.length === 0)) return;
  links.forEach((link) => {
    link.addEventListener('click', async (e) => {
      e.preventDefault();
      await openModal(link.href);
    });
  });
  // Sign-in override for SUSI Light
  const signInElem = document.querySelector('header #universal-nav .unav-comp-profile .profile-signed-out button');
  if (signInElem) {
    signInElem.addEventListener('click', async (e) => {
      e.preventDefault();
      signInOverride();
      e.stopImmediatePropagation();
      e.stopPropagation();
    }, true);
  }
}

// Fetch locale from cookie
export function getLocaleFromCookie() {
  const match = document.cookie.match(/(^| )locale=([^;]+)/);
  if (match) {
    return match[2];
  }
  return null;
}

export function convertLocaleFormat(locale) {
  return locale.replace('-', '_');
}

// Process i18n text
const langStoreCache = {
  cache: null,

  async fetchLangStoreData(locale, limit) {
    const resp = await fetch(`/localization/lang-store.json?limit=${limit}&sheet=${locale}`);
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

async function loadHeaderUtils() {
  const resp = await fetch('/fragments/header-utils.plain.html');
  if (resp.ok) {
    const headerUtils = document.createElement('div');
    headerUtils.innerHTML = await resp.text();
    console.log('headerUtils', headerUtils);
    const navItemWrapper = document.createElement('div');
    const children = headerUtils.querySelectorAll('p');
    children.forEach((p) => {
      const navItem = document.createElement('div');
      navItem.classList.add('feds-navItem');
      const a = p.querySelector('a');
      const ul = p.nextElementSibling;
      if (ul && ul.tagName === 'UL') {
        const button = document.createElement('button');
        button.classList.add('feds-navLink', 'feds-navLink--hoverCaret');
        button.setAttribute('aria-expanded', 'false');
        button.setAttribute('aria-haspopup', 'true');
        button.setAttribute('daa-lh', 'header|Open');
        button.setAttribute('daa-ll', a.textContent.replace(/\s+/g, '-'));
        button.textContent = a.textContent;
        const ulWrapper = document.createElement('div');
        ulWrapper.classList.add('feds-popup');
        const fedsMenuContent = document.createElement('div');
        fedsMenuContent.classList.add('feds-menu-content');
        const fedsMenuColumn = document.createElement('div');
        fedsMenuColumn.classList.add('feds-menu-column');
        fedsMenuColumn.append(ul);
        fedsMenuContent.append(fedsMenuColumn);
        ulWrapper.append(fedsMenuContent);
        navItem.append(button, ulWrapper);
      } else if (a) {
        if (p.querySelector('em')) {
          a.className = 'feds-cta feds-cta--primary';
        } else {
          a.classList.add('feds-navLink');
        }
        a.setAttribute('daa-ll', a.textContent.replace(/\s+/g, '-'));
        navItem.append(a);
      }
      navItemWrapper.append(navItem);
    });
    const utilsWrapper = document.querySelector('.feds-utilities');
    console.log('utilsWrapper', utilsWrapper);
    if (utilsWrapper) {
      utilsWrapper.prepend(...navItemWrapper.childNodes);
    }
  }
}

async function loadPage() {
  // eslint-disable-next-line no-unused-vars
  const { loadArea, setConfig, loadMartech } = await import(`${miloLibs}/utils/utils.js`);
  // eslint-disable-next-line no-unused-vars
  const config = setConfig({ ...CONFIG, miloLibs });
  await decorateI18n(document.querySelector('main'));
  await loadArea();
  await loadHeaderUtils();
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
  import(`${origin}/aemedge/scripts/dapreview.js`).then(({ default: daPreview }) => daPreview(loadPage));
}());
