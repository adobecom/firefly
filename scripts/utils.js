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

const FEATURES_API = 'https://p13n.adobe.io/fg/api/v3/feature';

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
  alt = '',
  active = false,
  eager = false,
  fetchpriority = 'low',
  breakpoints = [
    // { media: '(min-width: 2000px)', width: '3000' },
    { media: '(min-width: 1200px)', width: '2000' },
    { media: '(min-width: 900px)', width: '1200' },
    { media: '(min-width: 600px)', width: '900' },
    { media: '(min-width: 450px)', width: '600' },
    { width: '450' },
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
  img.setAttribute('loading', eager ? 'eager' : 'lazy');
  img.setAttribute('fetchpriority', fetchpriority);
  img.setAttribute('class', active ? 'active' : '');
  img.setAttribute('alt', alt);
  picture.appendChild(img);
  img.setAttribute('src', `${src.replace('{size}', DEFAULT_SIZE)}`);
  return picture;
}

/**
 * Add <img> for icon, prefixed with codeBasePath and optional prefix.
 * @param {Element} [span] span element with icon classes
 * @param {string} [prefix] prefix to be added to icon src
 * @param {string} [alt] alt text to be added to icon
 */
function decorateIcon(span, alt = '') {
  const iconName = Array.from(span.classList)
    .find((c) => c.startsWith('icon-'))
    .substring(5);
  const img = document.createElement('img');
  img.dataset.iconName = iconName;
  img.src = `/icons/${iconName}.svg`;
  img.alt = alt || iconName;
  img.loading = 'lazy';
  span.append(img);
}

/**
 * Add <img> for icons, prefixed with codeBasePath and optional prefix.
 * @param {Element} [element] Element containing icons
 * @param {string} [prefix] prefix to be added to icon the src
 */
export function decorateIcons(element) {
  const icons = [...element.querySelectorAll('span.icon')];
  icons.forEach((span) => {
    decorateIcon(span);
  });
}

/**
 * Retrieves an array of features from the server.
 * @returns {Promise<Array>} A promise that resolves to an array of features.
 */
export async function getFeaturesArray() {
  let featuresArray = [];
  const accessToken = window.adobeIMS.getAccessToken();
  const url = `${FEATURES_API}?clientId=clio-playground-web&meta=true&clioPreferredLocale=en_US`;
  const headers = new Headers({
    'X-Api-Key': 'clio-playground-web',
    Authorization: `Bearer ${accessToken.token}`,
  });
  const resp = await fetch(url, {
    method: 'GET',
    headers,
  });
  if (resp.ok) {
    const features = await resp.json();
    featuresArray = features.releases[0].features ? features.releases[0].features : [];
  }
  window.featuresArray = featuresArray;
}
