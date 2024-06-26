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
const FEATURES_API_STAGE = 'https://p13n-stage.adobe.io';
const FEATURES_API_PROD = 'https://p13n.adobe.io';

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

function buildTooltip(main) {
  const tooltipSVGs = main.querySelectorAll('picture > img[src*="tooltip.svg"]');

  tooltipSVGs.forEach((img) => {
    const tooltipText = img.alt.trim() || '';

    img.addEventListener('mouseenter', () => {
      const tooltip = document.createElement('span');
      tooltip.classList.add('tooltip');
      tooltip.textContent = tooltipText;
      img.parentNode.appendChild(tooltip);
    });

    img.addEventListener('mouseleave', () => {
      const tooltip = img.parentNode.querySelector('.tooltip');
      if (tooltip) {
        tooltip.remove();
      }
    });
  });
}

export function buildAutoBlocks(main) {
  buildTooltip(main);
}

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

export async function getAccessToken() {
  const { loadIms } = await import(`${getLibs()}/utils/utils.js`);
  let authToken;
  if (!window.adobeIMS) {
    loadIms().then(async () => {
      authToken = window.adobeIMS.isSignedInUser() ? window.adobeIMS.getAccessToken().token : null;
    }).catch(() => {
      authToken = null;
    });
  } else {
    authToken = window.adobeIMS.isSignedInUser() ? window.adobeIMS.getAccessToken().token : null;
  }
  return authToken;
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
