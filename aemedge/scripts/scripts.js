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
import { openModal, createModal } from '../blocks/modal/modal.js';
import { loadScript, getMetadata } from './aem.js';
import { initAnalytics, makeFinalPayload, ingestAnalytics, recordRenderPageEvent } from './analytics.js';

const UDS_STAGE_URL = 'https://uds-stg.adobe-identity.com';
const UDS_PROD_URL = 'https://uds.adobe-identity.com';
const UPGRADE_API_STAGE = 'https://aps-web-stage.adobe.io';
const UPGRADE_API_PROD = 'https://aps-web.adobe.io';
const buildMode = getMetadata('buildmode');

const searchParams = new URLSearchParams(window.location.search);

// Add project-wide style path here.
const STYLES = '/aemedge/styles/styles.css';

// Use 'https://milo.adobe.com/libs' if you cannot map '/libs' to milo's origin.
const LIBS = '/libs';

// Add any config options.
const CONFIG = {
  codeRoot: '/aemedge',
  // contentRoot: '',
  // imsClientId: 'firefly-milo',
  // imsScope: 'AdobeID,openid,gnav,pps.read,additional_info.roles,read_organizations',
  imsClientId: 'clio-playground-web',
  imsScope: 'AdobeID,firefly_api,openid,pps.read,additional_info.projectedProductContext,additional_info.ownerOrg,uds_read,uds_write,ab.manage,read_organizations,additional_info.roles',
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

function loadLegalBanner() {
  const legalBanner = document.createElement('div');
  legalBanner.classList.add('legal-banner');
  const legalBannerContent = document.createElement('div');
  legalBannerContent.classList.add('legal-banner-content');
  const legalBannerIcon = document.createElement('img');
  legalBannerIcon.src = '../aemedge/icons/warning-black.svg';
  legalBannerContent.append(legalBannerIcon);
  const legalBannerText = document.createElement('p');
  legalBannerText.textContent = 'To use Firefly, you must agree to the Adobe Generative AI User Guidelines.';
  legalBannerContent.append(legalBannerText);
  const legalBannerButton = document.createElement('button');
  legalBannerButton.classList.add('legal-banner-button');
  legalBannerButton.textContent = 'View User Guidelines';
  legalBannerButton.addEventListener('click', async () => {
    await openModal('/fragments/legal');
  });
  legalBannerContent.append(legalBannerButton);
  legalBanner.append(legalBannerContent);
  document.querySelector('header').prepend(legalBanner);
}

async function loadProfile() {
  const udsUrl = (buildMode === 'prod') ? UDS_PROD_URL : UDS_STAGE_URL;
  if (!window.adobeIMS) return;
  const authToken = window.adobeIMS.getAccessToken()?.token;
  if (!authToken) return;
  const url = `${udsUrl}/userdocs/firefly-web`;
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
    if (!profile.data['legal-user-acceptance']) {
      await openModal('/fragments/legal');
      loadLegalBanner();
    }
  } else {
    await openModal('/fragments/legal');
    loadLegalBanner();
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
export async function signInOverride() {
  try {
    const main = document.querySelector('main');
    const sentryWrapper = main.querySelector('.sentry-wrapper');
    if (sentryWrapper) {
      sentryWrapper.classList.remove('hidden');
    } else {
      const susiConfig = { 'consentProfile': 'adobe-id-sign-up' };
      const darkMode = window?.matchMedia('(prefers-color-scheme: dark)')?.matches || false;
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

      const analyticsEvent = makeFinalPayload({
        'event.subcategory': 'Navigation',
        'event.subtype': 'signin',
        'event.type': 'click',
      });
      ingestAnalytics([analyticsEvent]);
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
    const text = el.textContent.trim();
    if (!el.closest('pre') && text.startsWith('$')) {
      const newText = processText(text, langStoreData, locale);
      const textNode = document.createTextNode(newText);
      el.parentNode.replaceChild(textNode, el);
    }
  });

  // Process multi-line <code> blocks wrapped in <pre>
  block.querySelectorAll('pre code').forEach((el) => {
    const text = el.textContent.trim();
    if (text.startsWith('$')) {
      const keys = text.split(/\s+/);
      const newTexts = keys.map((key) => {
        const newText = processText(key, langStoreData, locale);
        return `<p>${newText}</p>`;
      });
      el.parentNode.outerHTML = newTexts.join('');
    }
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

/**
 * Decorates external links by adding target="_blank" and rel="noopener".
 * @param {HTMLElement} element - The element containing the external links.
 */
export function decorateExternalLink(element) {
  const anchors = element.querySelectorAll('a');
  anchors.forEach((link) => {
    const url = new URL(link.getAttribute('href'));
    if (!(window.location.hostname === url.hostname)) {
      link.setAttribute('target', '_blank');
      link.setAttribute('rel', 'noopener');
    }
  });
}

async function loadUpgradeModal() {
  let upgradeUrl = (buildMode === 'prod') ? UPGRADE_API_PROD : UPGRADE_API_STAGE;
  upgradeUrl = `${upgradeUrl}/webapps/access_profile/v3?include_disabled_fis=true`;
  if (!window.adobeIMS) return;
  const authToken = window.adobeIMS.getAccessToken()?.token;
  if (!authToken) return;
  const resp = await fetch(upgradeUrl, {
    method: 'POST',
    headers: {
      'x-api-key': 'clio-playground-web',
      Authorization: `Bearer ${authToken}`,
      'Content-Type': 'application/json',
    },
    body: `{"appDetails":{"nglAppId":"Firefly1","nglAppVersion":"1.0","nglLibRuntimeMode":"NAMED_USER_ONLINE","locale":"en-US"},"workflowResult":{"type":"WEB_APP_MODAL_WORKFLOW","version":"2","id":"ondemand_purchase_subscription_workflow","instanceId":"0f3ee0d5-3cd5-4217-84e3-08162e04e54a","response":"ondemand_request::reason=ff_free_user_upgrade&contextual_params=eyJjbGkiOiJmaXJlZmx5IiwiY3R4IjoiaWYiLCJsYW5nIjoiZW4iLCJjbyI6IklOIiwiY3R4UnRVcmwiOiJodHRwczovL2ZpcmVmbHktc3RhZ2UuY29ycC5hZG9iZS5jb20vP2xhdW5jaFBheXdhbGw9dHJ1ZSZwYXl3YWxsVmFyaWF0aW9uPVVQU0VMTF9OQVZCQVIifQ==&device_type=DESKTOP"}}`,
  });
  if (resp.ok) {
    const respJson = await resp.json();
    console.log('respJson', respJson);
    const upgradeIframeUrl = respJson.workflow.entryUrl;
    if (upgradeIframeUrl) {
      const iframe = document.createElement('iframe');
      iframe.src = upgradeIframeUrl;
      iframe.allow = 'payment';
      iframe.style.display = 'block';
      const modal = await createModal([iframe]);
      modal.showModal();
    }
  }
}

// Load header links that are wrapped in feds-utilities and aligned to the right
async function loadFireflyUtils(gnav) {
  const headerUtils = gnav.querySelector('.firefly-utils');
  if (headerUtils) {
    decorateExternalLink(headerUtils);
    const navItemWrapper = document.createElement('div');
    const children = headerUtils.querySelectorAll('p');
    children.forEach((p) => {
      const featureFlag = p.querySelector('code');
      if (featureFlag) {
        const flag = featureFlag.textContent.trim();
        if (!window.featuresArray.includes(flag)) {
          return;
        }
      }
      const navItem = document.createElement('div');
      navItem.classList.add('feds-navItem');
      const a = p.querySelector('a');
      const nextEl = p.nextElementSibling;
      if (nextEl && nextEl.tagName === 'UL') {
        const ul = nextEl;
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
        ul.querySelectorAll('li').forEach((li) => {
          if (li.querySelector('a')) {
            li.querySelectorAll('a').forEach((anchor) => {
              if (anchor.textContent.endsWith('.svg')) {
                const picture = document.createElement('picture');
                const img = document.createElement('img');
                img.src = anchor.textContent;
                img.loading = 'lazy';
                picture.append(img);
                anchor.before(picture);
                anchor.remove();
              } else {
                anchor.classList.add('feds-navLink');
                anchor.setAttribute('daa-ll', anchor.textContent);
              }
            });
          }
        });
        fedsMenuContent.append(fedsMenuColumn);
        ulWrapper.append(fedsMenuContent);
        navItem.append(button, ulWrapper);
        button.addEventListener('click', () => {
          navItem.classList.toggle('feds-dropdown--active');
          button.setAttribute('aria-expanded', button.getAttribute('aria-expanded') === 'true' ? 'false' : 'true');
          button.setAttribute('daa-lh', button.getAttribute('aria-expanded') === 'true' ? 'header|Close' : 'header|Open');
        });
      } else if (a) {
        if (p.querySelector('em')) {
          a.className = 'feds-cta feds-cta--primary';
        } else {
          a.classList.add('feds-navLink');
        }
        a.setAttribute('daa-ll', a.textContent.replace(/\s+/g, '-'));
        navItem.append(a);
        if (nextEl && nextEl.tagName === 'H3') {
          const tooltip = document.createElement('div');
          tooltip.classList.add('feds-tooltip');
          tooltip.textContent = nextEl.textContent;
          navItem.append(a, tooltip);
        }
      }
      navItemWrapper.append(navItem);
    });
    const utilsWrapper = document.querySelector('.feds-utilities');
    if (utilsWrapper) {
      utilsWrapper.prepend(...navItemWrapper.childNodes);
    }
    const upgradeBtn = utilsWrapper.querySelector('[daa-ll="Upgrade"]');
    if (upgradeBtn) {
      upgradeBtn.parentElement.addEventListener('click', (e) => {
        e.preventDefault();
        loadUpgradeModal();
      });
    }
  }
}

/**
 * Decorates the Firefly logo. Adds logos for dark mode and mobile.
 * @param {HTMLElement} gnav - The global navigation element.
 */
function decorateFireflyLogo(gnav) {
  const logo = gnav.querySelector('.firefly-logo');
  if (logo) {
    const brandContainer = document.querySelector('.feds-brand-image');
    const defaultLogo = brandContainer.querySelector('img');
    if (defaultLogo) {
      defaultLogo.classList.add('logo-light');
    }
    if (logo) {
      [...logo.children].forEach((row) => {
        if (row.firstElementChild.innerText === 'dark') {
          const img = document.createElement('img');
          img.src = row.lastElementChild.querySelector('a').innerText;
          img.classList.add('logo-dark');
          img.loading = 'lazy';
          brandContainer.append(img);
        } else if (row.firstElementChild.innerText === 'mobile') {
          const img = document.createElement('img');
          img.src = row.lastElementChild.querySelector('a').innerText;
          img.classList.add('logo-mobile');
          img.loading = 'lazy';
          brandContainer.append(img);
        }
      });
    }
  }
}

async function loadFireflyHeaderComponents() {
  const resp = await fetch('/gnav.plain.html');
  if (resp.ok) {
    const gnav = document.createElement('div');
    gnav.innerHTML = await resp.text();
    decorateFireflyLogo(gnav);
    loadFireflyUtils(gnav);
  }

  const navLinks = document.querySelectorAll('nav a.feds-navLink');

  navLinks.forEach((link) => {
    link.addEventListener('click', () => {
      const analyticsEvent = makeFinalPayload({
        "event.subcategory": "Navigation",
        "event.subtype": link.innerText,
        "event.type": "click",
      });
      ingestAnalytics([analyticsEvent]);
    });
  });
}

async function loadPage() {
  // eslint-disable-next-line no-unused-vars
  const { loadArea, setConfig, loadMartech } = await import(`${miloLibs}/utils/utils.js`);
  // eslint-disable-next-line no-unused-vars
  const config = setConfig({ ...CONFIG, miloLibs });
  await decorateI18n(document.querySelector('main'));
  await loadArea();
  loadProfile();
  setTimeout(async () => {
    await loadFireflyHeaderComponents();
    await headerModal();
  }, 0);
  setTimeout(() => {
    loadMartech();
    initAnalytics();
    recordRenderPageEvent(document.querySelector('a.feds-navLink[aria-current="page"]').textContent, undefined);
  }, 3000);
}

loadPage();

(async function livePreview() {
  const preview = new URL(window.location.href).searchParams.get('dapreview');
  if (!preview) return;
  const origin = preview === 'local' ? 'http://localhost:3000' : 'https://da.live';
  import(`${origin}/aemedge/scripts/dapreview.js`).then(({ default: daPreview }) => daPreview(loadPage));
}());
