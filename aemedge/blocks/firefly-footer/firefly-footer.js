/* eslint-disable no-console */
/* eslint-disable max-len */
/* eslint-disable no-underscore-dangle */
import { getLibs, getLocale, convertLocaleFormat } from '../../scripts/utils.js';
import { decorateI18n } from '../../scripts/scripts.js';

const { createTag, getMetadata, decorateSVG } = await import(`${getLibs()}/utils/utils.js`);
const BANNER_ENDPOINT = 'https://p13n.adobe.io/psdk/v2/content';

async function decorateBanner(footerBanner) {
  const locale = getLocale() || 'en-US';
  const localeForAPI = convertLocaleFormat(locale);
  const surfaceIdElement = footerBanner.querySelector('div > div > div');
  if (surfaceIdElement) {
    const surfaceId = surfaceIdElement.textContent.trim();
    surfaceIdElement.remove();
    const headers = new Headers({ 'X-Api-Key': 'clio-playground-web' });
    const bannerResponse = await fetch(`${BANNER_ENDPOINT}?surfaceId=${surfaceId}&productLanguage=${localeForAPI}&&clioPreferredLocale=${localeForAPI}`, {
      method: 'GET',
      headers,
    });

    const respJson = await bannerResponse.json();
    const testFireflyBannerGrowthData = respJson.surfaces.Test_Firefly_Banner_Growth.containers[0].data;
    const jsonObject = JSON.parse(testFireflyBannerGrowthData);
    const { bannerItem } = jsonObject.data.fireflyToastBannerByPath.item;
    const randomBannerIndex = Math.floor(Math.random() * bannerItem.length);
    const randomBannerItem = bannerItem[randomBannerIndex];
    if (randomBannerItem) {
      const { imageList, cta } = randomBannerItem;
      if (imageList && cta) {
        const img = createTag('img', { src: imageList[0]._publishUrl });
        const bannerLink = createTag('a', {
          href: cta.actionUrl.url,
          target: '_blank',
        });
        bannerLink.textContent = cta.label;
        const bannerCTA = createTag('div', { class: 'footer-banner-cta' });
        const bannerImage = createTag('div', { class: 'footer-banner-image' });
        const bannerClose = createTag('div', { class: 'footer-banner-close' });
        bannerImage.append(img);
        bannerCTA.append(bannerLink, bannerClose);
        footerBanner.append(bannerCTA, bannerImage);
        bannerClose.addEventListener('click', () => {
          footerBanner.style.display = 'none';
        });
      }
    }

    if (!bannerResponse.ok) {
      console.error('Failed to fetch images from API endpoint', bannerResponse.status, bannerResponse.statusText);
    }
  }
}

export default async function decorate(block) {
  const footerMeta = getMetadata('footer-source');
  const footerPath = footerMeta ? new URL(footerMeta, window.location).pathname : '/footer';

  if (footerPath) {
    const resp = await fetch(`${footerPath}.plain.html`);

    if (resp.ok) {
      const html = await resp.text();
      const tempDiv = document.createElement('div');
      tempDiv.innerHTML = html;

      const footerLinks = tempDiv.querySelectorAll('a');
      footerLinks.forEach((link) => {
        decorateSVG(link);
      });

      block.innerHTML = '';
      while (tempDiv.firstChild) {
        block.appendChild(tempDiv.firstChild);
      }
      decorateI18n(block);
    }
  }

  const firstPicture = block.querySelector('p picture');
  if (firstPicture) {
    if (firstPicture.parentElement.tagName === 'A') {
      firstPicture.parentElement.parentElement.classList.add('light-mode');
    } else {
      firstPicture.parentElement.classList.add('light-mode');
    }
  }

  const nextPicture = block.querySelector('p + p picture');
  if (nextPicture) {
    if (nextPicture.parentElement.tagName === 'A') {
      nextPicture.parentElement.parentElement.classList.add('dark-mode');
    } else {
      nextPicture.parentElement.classList.add('dark-mode');
    }
  }
  decorateBanner(block.querySelector('.footer-banner'));
}
