/* eslint-disable no-underscore-dangle */
import { getLibs, createOptimizedFireflyPicture } from '../../scripts/utils.js';
import { getI18nValue } from '../../scripts/scripts.js';

const { createTag } = await import(`${getLibs()}/utils/utils.js`);
const ASSET_BASE_URL = 'https://community-hubs.adobe.io/api/v2/ff_community/assets/';
const TEXT_TO_IMAGE_BASE_URL = 'https://firefly.adobe.com/community/view/texttoimage?id=';
const DEFAULT_FORMAT = 'jpg';
const DEFAULT_DIMENSION = 'width';
const API_KEY = 'clio-playground-web';
let index = 0;
let isAdding = true;

function textToImage(block) {
  const activeImage = block.querySelector('img.active');
  const docId = activeImage.id;
  const targetUrl = TEXT_TO_IMAGE_BASE_URL + docId;
  window.open(targetUrl, '_blank');
}

function updateAuthor(author, authorName, authorImage) {
  if (author && author.children.length === 0) {
    const authorImageTag = createTag('img', { src: authorImage, alt: authorName });
    const authorNameTag = createTag('span');
    authorNameTag.textContent = authorName;
    author.append(authorImageTag, authorNameTag);
  } else {
    const authorImageTag = author.querySelector('img');
    const authorNameTag = author.querySelector('span');
    authorImageTag.src = authorImage;
    authorImageTag.alt = authorName;
    authorNameTag.textContent = authorName;
  }
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
  const activePicture = active.parentElement;
  // Add Author information
  const { authorName, authorImage } = activePicture.dataset;
  if (authorName && authorImage) {
    const author = block.querySelector('.author');
    updateAuthor(author, authorName, authorImage);
  }
  if (first) {
    typeAnimation(input, active.alt, block);
  } else {
    const nextSibling = active.parentElement.nextElementSibling;
    const next = nextSibling?.querySelector('img') || block.querySelector('img');
    const nextText = next.alt;
    active.classList.remove('active');
    next.classList.add('active');
    input.textContent = '';
    typeAnimation(input, nextText, block);
  }
}

async function createPitcureFromAssetId(assetId, active, eager, fetchPriority) {
  const imageId = assetId.textContent.trim();
  if (!imageId || imageId === '') return null;
  const resp = await fetch(ASSET_BASE_URL + imageId, { headers: { 'X-Api-Key': API_KEY } });
  if (resp.ok) {
    const imageDetails = await resp.json();
    const imageHref = imageDetails._embedded.artwork._links.rendition.href;
    const imageUrl = imageHref.replace('{format}', DEFAULT_FORMAT).replace('{dimension}', DEFAULT_DIMENSION);
    const userLocale = window.adobeIMS?.adobeIdData?.locale.replace('_', '-') || navigator.language || 'en-US';
    const prompt = imageDetails.custom.input['firefly#prompts'][userLocale];
    const picture = createOptimizedFireflyPicture(imageUrl, prompt, active, eager, fetchPriority);
    const authorName = imageDetails._embedded.owner.display_name;
    const authorImage = (imageDetails._embedded.owner._links.images)[0].href;
    if (authorName) picture.dataset.authorName = authorName;
    if (authorImage) picture.dataset.authorImage = authorImage;
    return picture;
  }
  return null;
}

export default async function decorate(block) {
  const assetIds = block.querySelectorAll('p');
  block.innerHTML = '';
  const imageContainer = createTag('div', { class: 'image-container' });
  // Get the first image in quickly and then process the rest
  const firstAssetId = assetIds[0];
  const firstPicture = await createPitcureFromAssetId(firstAssetId, true, true, 'high');
  if (firstPicture !== null) imageContainer.append(firstPicture);
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
  generateButton.textContent = await getI18nValue('prompt-bar-generate-button-title');
  form.append(input, generateButton);
  contentContainer.append(form);
  const author = createTag('div', { class: 'author' });
  block.append(author);
  generateButton.addEventListener('click', () => {
    textToImage(block);
  });
  // Get the rest of the images
  assetIds.forEach(async (assetId, i) => {
    if (i !== 0) {
      const picture = await createPitcureFromAssetId(assetId, false, false, 'high');
      if (picture !== null) imageContainer.append(picture);
    }
  });
  setTimeout(() => {
    animate(block, true);
  }, 3000);
}
