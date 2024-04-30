/* eslint-disable no-underscore-dangle */
import { getLibs } from '../../scripts/utils.js';

const { createTag } = await import(`${getLibs()}/utils/utils.js`);
const ASSET_BASE_URL = 'https://community-hubs.adobe.io/api/v2/ff_community/assets/';
const TEXT_TO_IMAGE_BASE_URL = 'https://firefly.adobe.com/community/view/texttoimage?id=';
const DEFAULT_FORMAT = 'jpg';
const DEFAULT_DIMENSION = 'width';
const DEFAULT_SIZE = '2000';
const API_KEY = 'clio-playground-web';
let index = 0;
let isAdding = true;

function textToImage(block) {
  const activeImage = block.querySelector('img.active');
  const docId = activeImage.id;
  const targetUrl = TEXT_TO_IMAGE_BASE_URL + docId;
  window.open(targetUrl, '_blank');
}

function typeAnimation(input, text, block) {
  const timeoutid = setTimeout(() => {
    input.innerText = text.slice(0, index);
    // If typing
    if (isAdding) {
      if (index >= text.length) {
        isAdding = false;
        // If text typed completely, wait 2s before starting to remove it.
        setTimeout(() => {
          typeAnimation(input, text, block);
        }, 2000);
        return;
      }
      // Continue to typing text by increasing index
      index += 1;
    } else {
      // If removing
      if (index === 0) {
        isAdding = true;
        // If text removed completely, move on to next text by increasing typeIndex
        input.textContent = '';
        // eslint-disable-next-line no-use-before-define
        animate(block);
        return;
      }
      // Continue to removing text by decreasing index
      index -= 1;
    }
    typeAnimation(input, text, block);
  }, isAdding ? 100 : 50);
  input.addEventListener('click', () => {
    input.textContent = text;
    clearTimeout(timeoutid);
    index = 0;
    isAdding = true;
  });
}

function animate(block, first = false) {
  const active = block.querySelector('img.active');
  const input = block.querySelector('.generate-input');
  if (first) {
    typeAnimation(input, active.alt, block);
  } else {
    const next = active.nextElementSibling || block.querySelector('img');
    const nextText = next.alt;
    active.classList.remove('active');
    next.classList.add('active');
    input.textContent = '';
    typeAnimation(input, nextText, block);
  }
}

export default async function decorate(block) {
  const assetIds = block.querySelectorAll('p');
  block.innerHTML = '';
  const imageContainer = createTag('div', { class: 'image-container' });
  assetIds.forEach(async (assetId, i) => {
    const imageId = assetId.textContent.trim();
    if (!imageId || imageId === '') return;
    const resp = await fetch(ASSET_BASE_URL + imageId, { headers: { 'X-Api-Key': API_KEY } });
    if (resp.ok) {
      const imageDetails = await resp.json();
      const imageHref = imageDetails._embedded.artwork._links.rendition.href;
      const imageUrl = imageHref.replace('{format}', DEFAULT_FORMAT).replace('{dimension}', DEFAULT_DIMENSION).replace('{size}', DEFAULT_SIZE);
      const userLocale = window.adobeIMS?.adobeIdData?.locale.replace('_', '-') || navigator.language;
      const prompt = imageDetails.custom.input['firefly#prompts'][userLocale];
      const img = createTag('img', {
        src: imageUrl,
        alt: prompt,
        id: imageId,
      });
      if (i === 0) {
        img.loading = 'eager';
        img.fetchpriority = 'high';
        img.classList.add('active');
      }
      imageContainer.append(img);
    }
  });
  block.append(imageContainer);
  const parent = block.parentElement;
  const heading = parent.querySelector('h1');
  const contentContainer = createTag('div', { class: 'content-container' });
  contentContainer.append(heading);
  parent.querySelector('div.content').remove();
  block.append(contentContainer);
  const form = createTag('div', { class: 'generate-form' });
  const input = createTag('span', { contenteditable: 'true', class: 'generate-input' });
  const generateButton = createTag('button', { class: 'generate-button' });
  generateButton.textContent = 'Generate';
  form.append(input, generateButton);
  contentContainer.append(form);
  generateButton.addEventListener('click', () => {
    textToImage(block);
  });
  setTimeout(() => {
    animate(block, true);
  }, 2000);
}
