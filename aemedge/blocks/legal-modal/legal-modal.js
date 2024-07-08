import { getLibs, getEnvironment } from '../../scripts/utils.js';
import { ingestAnalytics, makeFinalPayload } from '../../scripts/analytics.js';

const { loadIms } = await import(`${getLibs()}/utils/utils.js`);

const UDS_STAGE_URL = 'https://uds-stg.adobe-identity.com';
const UDS_PROD_URL = 'https://uds.adobe-identity.com';

async function legalUserAcceptance() {
  const environment = getEnvironment();
  const udsUrl = (environment === 'prod') ? UDS_PROD_URL : UDS_STAGE_URL;
  return new Promise((resolve, reject) => {
    if (!window.adobeIMS) {
      loadIms();
    }
    if (window.adobeIMS.isSignedInUser()) {
      const adobeIms = sessionStorage.getItem(Object.keys(sessionStorage).find((key) => key.includes('adobeid_ims')));
      const adobeImsToken = JSON.parse(adobeIms);
      if (adobeImsToken.userId) {
        fetch(`${udsUrl}/userdocs/firefly-web?version=0`, {
          method: 'PATCH',
          headers: {
            Authorization: `Bearer ${window.adobeIMS.getAccessToken().token}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ documentId: { appDomain: 'firefly-web', ownerEntity: adobeImsToken.userId }, data: { 'legal-user-acceptance': 1701406800000 } }),
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

function triggerAnalytics(legalContent) {
  const analyticsEvent = makeFinalPayload({
    'event.subcategory': 'Product Improvement',
    'event.subtype': 'consent',
    'event.type': 'success',
    'event.value': legalContent,
  });
  ingestAnalytics([analyticsEvent]);
}

export default async function decorate(block) {
  const heroPic = block.querySelector('picture');
  heroPic.parentElement.replaceWith(heroPic);
  const legalContent = document.createElement('div');
  legalContent.classList.add('legal-content');
  const p = block.querySelectorAll('p');
  const h4 = block.querySelector('h4');
  legalContent.append(h4);
  legalContent.append(...p);
  const legalFooter = document.createElement('div');
  legalFooter.classList.add('legal-footer');
  const cancel = document.createElement('button');
  cancel.classList.add('cancel');
  cancel.textContent = 'Cancel';
  cancel.addEventListener('click', () => {
    const dialogs = document.querySelectorAll('dialog');
    dialogs.forEach((dialog) => {
      dialog.close();
    });
  });
  const agree = document.createElement('button');
  agree.classList.add('agree');
  agree.textContent = 'Agree';
  agree.addEventListener('click', async () => {
    const dialogs = document.querySelectorAll('dialog');
    legalUserAcceptance().then(() => {
      triggerAnalytics(legalContent.textContent);
      dialogs.forEach((dialog) => {
        dialog.close();
      });
      const legalBanner = document.querySelector('.legal-banner');
      console.log('legalBanner', legalBanner);
      legalBanner.remove();
    });
  });
  legalFooter.append(cancel);
  legalFooter.append(agree);
  block.append(legalContent);
  block.append(legalFooter);
}
