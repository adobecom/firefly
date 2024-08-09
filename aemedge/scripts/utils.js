/* eslint-disable max-len */
/* eslint-disable import/no-cycle */
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
import { FEATURES_API_STAGE, FEATURES_API_PROD, APS_API_PROD, APS_API_STAGE } from './constants.js';

const FIREFLY_FI = 'firefly_credits';
const AccessibleItemStatus = {
  ACTIVE: 'ACTIVE',
  INACTIVE: 'INACTIVE',
};

const FeatureKeys = {
  BASIC: 'basic',
  PREMIUM: 'premium',
  HARD_CAPPED: 'hard_capped',
  SOFT_CAPPED: 'soft_capped',
  K12: 'k12',
};

const profile = {
  isPremium: false,
  isHardCapped: false,
  isSoftCapped: false,
  isK12: false,
  isFree: false,
  isEnterprise: false,
};

/**
 * The decision engine for where to get Milo's libs from.
 */
export const [setLibs, getLibs] = (() => {
  let libs;
  return [
    (prodLibs, location) => {
      libs = (() => {
        const { hostname, search } = location || window.location;
        if (!(hostname.includes('.aem.') || hostname.includes('.hlx.') || hostname.includes('local'))) return prodLibs;
        const branch = new URLSearchParams(search).get('milolibs') || 'main';
        if (branch === 'local') return 'http://localhost:6456/libs';
        return branch.includes('--') ? `https://${branch}.hlx.live/libs` : `https://${branch}--milo--adobecom.hlx.live/libs`;
      })();
      return libs;
    }, () => libs,
  ];
})();

/*
 * ------------------------------------------------------------
 * Edit above at your own risk.
 *
 * Note: This file should have no self-invoking functions.
 * ------------------------------------------------------------
 */
const DEFAULT_SIZE = '2000';

export function decorateArea(area = document) {
  const eagerLoad = (parent, selector) => {
    const img = parent.querySelector(selector);
    img?.removeAttribute('loading');
  };

  (async function loadLCPImage() {
    const superhero = area.querySelector('.superhero');
    if (!superhero) {
      eagerLoad(area, 'img');
      return;
    }

    // First image of first row
    eagerLoad(superhero, 'img');
  }());
}

export function createOptimizedFireflyPicture(
  src,
  imageId,
  alt = '',
  active = false,
  eager = false,
  fetchpriority = 'low',
  breakpoints = [
    // { media: '(min-width: 2000px)', width: '3000' },
    { media: '(min-width: 1200px)', width: '3000' },
    // { media: '(min-width: 900px)', width: '1200' },
    // { media: '(min-width: 600px)', width: '900' },
    // { media: '(min-width: 450px)', width: '600' },
    { width: '1200' },
  ],
) {
  const picture = document.createElement('picture');
  // different widths
  breakpoints.forEach((br) => {
    const source = document.createElement('source');
    if (br.media) source.setAttribute('media', br.media);
    source.setAttribute('srcset', `${src.replace('{size}', br.width)}`);
    picture.appendChild(source);
  });
  // fallback
  const img = document.createElement('img');
  img.id = imageId;
  img.setAttribute('loading', eager ? 'eager' : 'lazy');
  img.setAttribute('fetchpriority', fetchpriority);
  img.setAttribute('class', active ? 'active' : '');
  img.setAttribute('alt', alt);
  picture.appendChild(img);
  img.setAttribute('src', `${src.replace('{size}', DEFAULT_SIZE)}`);
  return picture;
}

export function getAccessToken() {
  return new Promise((resolve, reject) => {
    import(`${getLibs()}/utils/utils.js`)
      .then(({ loadIms }) => {
        let authToken;
        if (!window.adobeIMS) {
          loadIms()
            .then(() => {
              authToken = window.adobeIMS.isSignedInUser() ? window.adobeIMS.getAccessToken().token : null;
              resolve(authToken);
            })
            .catch(() => {
              authToken = null;
              resolve(authToken);
            });
        } else {
          authToken = window.adobeIMS.isSignedInUser() ? window.adobeIMS.getAccessToken().token : null;
          resolve(authToken);
        }
      })
      .catch((error) => {
        reject(error);
      });
  });
}

/**
 * Returns the environment based on the hostname of the current window location.
 * @returns {string} The environment ('stage' or 'prod').
 */
export function getEnvironment() {
  const { hostname } = window.location;
  if (hostname.includes('localhost') || hostname.includes('hlx.live') || hostname.includes('hlx.page') || hostname.includes('firefly-stage')) {
    return 'stage';
  }
  return 'prod';
}

// Fetch locale from browser or cookie
const FALLBACK_LOCALE = 'en-US';

function normalizeLocale(locale) {
  const lowerCaseLocale = locale.toLowerCase();

  // Handle Chinese locales
  if (lowerCaseLocale.startsWith('zh')) {
    if (lowerCaseLocale.includes('hans')) {
      return 'zh-Hans-CN';
    }
    if (lowerCaseLocale.includes('hant')) {
      return 'zh-Hant-TW';
    }
  }

  // Handle English locale
  const [language, region] = lowerCaseLocale.split(/[-_]/);
  if (language.includes('en')) {
    return FALLBACK_LOCALE;
  }

  // Default normalization for other locales
  if (region) {
    return `${language}-${region.toUpperCase()}`;
  }

  return FALLBACK_LOCALE;
}

export function getLocale() {
  const match = document.cookie.match(/(^| )locale=([^;]+)/);
  if (match) {
    return normalizeLocale(match[2]);
  }

  const browserLocale = navigator.language || navigator.userLanguage;
  if (browserLocale) {
    return normalizeLocale(browserLocale);
  }

  return FALLBACK_LOCALE;
}

export function convertLocaleFormat(locale) {
  return locale.replace('-', '_');
}

/**
 * Retrieves an array of features from the server.
 * @returns {Promise<Array>} A promise that resolves to an array of features.
 */
export async function getFeaturesArray() {
  const authToken = await getAccessToken();
  const environment = getEnvironment();
  const featuresUrl = environment === 'stage' ? FEATURES_API_STAGE : FEATURES_API_PROD;
  let featuresArray = [];
  const url = `${featuresUrl}/fg/api/v3/feature?clientId=clio-playground-web&meta=true&clioPreferredLocale=en_US`;
  const headers = new Headers({ 'X-Api-Key': 'clio-playground-web' });
  if (authToken) {
    headers.set('Authorization', `Bearer ${window.adobeIMS.getAccessToken()?.token}`);
  }
  const resp = await fetch(url, {
    method: 'GET',
    headers,
  });
  if (resp.ok) {
    const features = await resp.json();
    featuresArray = features.releases[0].features ? features.releases[0].features : [];
  }
  window.featuresArray = featuresArray;
  return featuresArray;
}

function parseAccessProfileResponse(accessProfileResponse) {
  // APS v3 uses URL safe Base 64 encoding (and not the usual Base 64 encoding which atob is designed to decode)
  // The only difference between the two encodings is that the characters _ and - are replaced by / and + respectively
  // https://www.rfc-editor.org/rfc/rfc4648#section-5
  const responsePayload = atob(
    accessProfileResponse.asnp.payload.replace(/_/g, '/').replace(/-/g, '+'),
  );
  const accessProfile = JSON.parse(responsePayload);
  if (accessProfileResponse.workflow?.entryUrl) {
    accessProfile.paywallURL = accessProfileResponse.workflow.entryUrl.toString();
  }
  return accessProfile;
}

async function getAccessProfileData() {
  const locale = getLocale();
  const environment = getEnvironment();
  const apsUrl = environment === 'stage' ? APS_API_STAGE : APS_API_PROD;
  const url = `${apsUrl}/webapps/access_profile/v3?include_disabled_fis=true`;
  return new Promise((resolve, reject) => {
    getAccessToken().then(async (accessToken) => {
      if (accessToken) {
        const resp = await fetch(url, {
          method: 'POST',
          headers: {
            'x-api-key': 'clio-playground-web',
            Authorization: `Bearer ${window.adobeIMS.getAccessToken()?.token}`,
            'Content-Type': 'application/json',
          },
          body: `{"appDetails":{"nglAppId":"Firefly1","nglAppVersion":"1.0","nglLibRuntimeMode":"NAMED_USER_ONLINE","locale":"${locale}"}}
`,
        });
        if (resp.ok) {
          const respJson = await resp.json();
          resolve(parseAccessProfileResponse(respJson));
        } else {
          reject(new Error('Failed to fetch access profile data'));
        }
      } else {
        reject(new Error('Access token not available'));
      }
    }).catch((error) => {
      reject(error);
    });
  });
}

export function setProfileObject() {
  getAccessProfileData().then((accessProfile) => {
    if (accessProfile.appProfile.accessibleItems?.length) {
      accessProfile.appProfile.accessibleItems.forEach((accessibleItem) => {
        if (accessibleItem.status !== AccessibleItemStatus.ACTIVE) {
          return;
        }
        if (!accessibleItem.fulfillable_items) {
          return;
        }
        const fireflyFi = accessibleItem.fulfillable_items[FIREFLY_FI];
        if (fireflyFi) {
          const featureSets = fireflyFi.feature_sets;
          if (featureSets) {
            profile.isFree = !!featureSets[FeatureKeys.BASIC]?.enabled;
            profile.isHardCapped = !!featureSets[FeatureKeys.HARD_CAPPED]?.enabled;
            profile.isSoftCapped = !!featureSets[FeatureKeys.SOFT_CAPPED]?.enabled;
            profile.isK12 = !!featureSets[FeatureKeys.K12]?.enabled;
            profile.isPremium = !!featureSets[FeatureKeys.PREMIUM]?.enabled;
          }
        }
      });
    }
    if (accessProfile.userProfile) {
      profile.isEnterprise = !!accessProfile.userProfile.accountType?.toLowerCase() !== 'type1';
    }
    window.profile = profile;
  });
}
