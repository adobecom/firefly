import { getLibs } from '../../scripts/utils.js';
import { openModal } from '../modal/modal.js';

const { loadIms } = await import(`${getLibs()}/utils/utils.js`);

async function legalUserAcceptance() {
  return new Promise((resolve, reject) => {
    if (!window.adobeIMS) {
      loadIms();
    }
    if (window.adobeIMS.isSignedInUser()) {
      const adobeIms = sessionStorage.getItem(Object.keys(sessionStorage).find((key) => key.includes('adobeid_ims')));
      const adobeImsToken = JSON.parse(adobeIms);
      if (adobeImsToken.userId) {
        fetch('https://uds.adobe-identity.com/userdocs/firefly-web?version=0', {
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
      dialogs.forEach((dialog) => {
        dialog.close();
      });
      const legalBanner = document.querySelector('.legal-banner');
      legalBanner.remove();
    });
  });
  legalFooter.append(cancel);
  legalFooter.append(agree);
  block.append(legalContent);
  block.append(legalFooter);
}
