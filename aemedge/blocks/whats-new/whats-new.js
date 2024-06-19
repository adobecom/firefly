import { getLibs, getFeaturesArray } from '../../scripts/utils.js';

import { getMetadata } from '../../scripts/aem.js';

const { createTag, loadIms } = await import(`${getLibs()}/utils/utils.js`);

const UDS_STAGE_URL = 'https://uds-stg.adobe-identity.com';
const UDS_PROD_URL = 'https://uds.adobe-identity.com';

function registerWhatsNew() {
  const buildMode = getMetadata('buildmode');
  const udsUrl = (buildMode === 'prod') ? UDS_PROD_URL : UDS_STAGE_URL;
  return new Promise((resolve, reject) => {
    if (!window.adobeIMS) {
      loadIms();
    }
    if (window.adobeIMS.isSignedInUser()) {
      const adobeIms = sessionStorage.getItem(Object.keys(sessionStorage).find((key) => key.includes('adobeid_ims')));
      const adobeImsToken = JSON.parse(adobeIms);
      if (adobeImsToken.userId) {
        fetch(`${udsUrl}/userdocs/firefly-web?version=1`, {
          method: 'PATCH',
          headers: {
            Authorization: `Bearer ${window.adobeIMS.getAccessToken().token}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ documentId: { appDomain: 'firefly-web', ownerEntity: adobeImsToken.userId }, data: { 'whats-new-dialog-confirmed': 1713844800000 } }),
        })
          .then((response) => {
            if (response.ok) {
              resolve(response);
            } else {
              reject(new Error('Fetch operation failed'));
            }
          })
          .catch((error) => {
            reject(error);
          });
      }
    }
    reject();
  });
}

export default async function decorate(block) {
  // move the block content into a child element first
  const content = createTag('div', { class: 'content' });
  content.innerHTML = block.innerHTML;
  block.innerHTML = '';
  block.append(content);
  // Get each quote element to build the left nav
  const nav = createTag('div', { class: 'nav' });
  const h2 = createTag('h3');
  h2.textContent = "What's new";
  nav.append(h2);
  const ul = document.createElement('ul');
  block.querySelectorAll('blockquote').forEach((quote) => {
    quote.parentElement.id = quote.textContent.trim().toLowerCase().replace(/ /g, '-');
    const li = document.createElement('li');
    const a = document.createElement('a');
    a.href = `#${quote.parentElement.id}`;
    a.textContent = quote.textContent;
    li.append(a);
    ul.append(li);
    quote.remove();
  });
  nav.append(ul);
  block.prepend(nav);
  let featuresArray = [];
  if (!window.adobeIMS) {
    await loadIms();
  }
  // eslint-disable-next-line max-len
  const authToken = window.adobeIMS.isSignedInUser() ? window.adobeIMS.getAccessToken().token : null;
  if (window.featuresArray) {
    featuresArray = window.featuresArray;
  } else {
    await getFeaturesArray(authToken);
    featuresArray = window.featuresArray;
  }
  // Replace the video links with videos
  [...content.children].forEach((row) => {
    const featureFlagEl = row.querySelector('code');
    if (featureFlagEl) {
      const featureFlag = featureFlagEl.innerText.trim();
      featureFlagEl.remove();
      if (!featuresArray.includes(featureFlag)) {
        row.remove();
      }
    }
    const firstLink = row.querySelector('a');
    if (firstLink.href && firstLink.href.endsWith('.mp4')) {
      const videoEl = document.createElement('video');
      videoEl.src = firstLink.href;
      videoEl.controls = false;
      videoEl.autoplay = true;
      videoEl.muted = true;
      videoEl.loop = true;
      videoEl.playsinline = true;
      firstLink.replaceWith(videoEl);
      videoEl.addEventListener('loadedmetadata', () => {
        videoEl.play();
      });
    }
  });

  setTimeout(() => {
    const dialog = block.closest('dialog');
    if (dialog) {
      const closeButton = dialog.querySelector('.close-button');
      closeButton.addEventListener('click', async () => {
        await registerWhatsNew();
      });
    }
  }, 1000);
}
