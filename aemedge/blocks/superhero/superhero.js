/* eslint-disable no-underscore-dangle */
import { getLibs, createOptimizedFireflyPicture } from '../../scripts/utils.js';
import { getI18nValue, getLocale } from '../../scripts/scripts.js';
import { ingestAnalytics, makeFinalPayload } from '../../scripts/analytics.js';
import { waitForLCP } from '../../scripts/aem.js';

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
  input.classList.remove('selected');
  const timeoutid = setTimeout(() => {
    input.innerText = `${text.slice(0, index)}`;
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
      input.scrollLeft = input.scrollWidth;
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
  }, isAdding ? 75 : 50);
  input.addEventListener('click', () => {
    input.textContent = text;
    input.classList.add('selected');
    clearTimeout(timeoutid);
    index = 0;
    isAdding = true;
    // select all the text content on click
    const range = document.createRange();
    range.selectNodeContents(input);
    const selection = window.getSelection();
    selection.removeAllRanges();
    selection.addRange(range);
  });
  // resume animation on click out event
  input.addEventListener('blur', () => {
    if (input.classList.contains('selected')) {
      // eslint-disable-next-line no-use-before-define
      animate(block);
    }
  });
}

function animate(block, first = false) {
  const active = block.querySelector('img.active');
  const input = block.querySelector('.generate-input');
  const activePicture = active.parentElement;
  if (first) {
    typeAnimation(input, active.alt, block);
    const { authorName, authorImage } = activePicture.dataset;
    if (authorName && authorImage) {
      const author = block.querySelector('.author');
      updateAuthor(author, authorName, authorImage);
    }
  } else {
    const nextSibling = active.parentElement.nextElementSibling;
    const { authorName, authorImage } = nextSibling.dataset;
    const next = nextSibling?.querySelector('img') || block.querySelector('img');
    const nextText = next.alt;
    active.classList.remove('active');
    next.classList.add('active');
    if (authorName && authorImage) {
      const author = block.querySelector('.author');
      updateAuthor(author, authorName, authorImage);
    }
    input.textContent = '';
    typeAnimation(input, nextText, block);
  }
}

async function createPitcureFromAssetId(assetId, active, eager, fetchPriority) {
  if (!assetId || assetId === '') return null;
  const resp = await fetch(ASSET_BASE_URL + assetId, { headers: { 'X-Api-Key': API_KEY } });
  if (resp.ok) {
    const imageDetails = await resp.json();
    const imageHref = imageDetails._embedded.artwork._links.rendition.href;
    const { height, width } = imageDetails._embedded.artwork;
    const imageUrl = imageHref.replace('{format}', DEFAULT_FORMAT).replace('{dimension}', DEFAULT_DIMENSION);
    const userLocale = getLocale() || window.adobeIMS?.adobeIdData?.locale.replace('_', '-') || 'en-US';
    const prompt = imageDetails.custom.input['firefly#prompts'][userLocale];
    // eslint-disable-next-line max-len
    const picture = createOptimizedFireflyPicture(imageUrl, assetId, prompt, active, eager, fetchPriority, [
      { media: '(min-width: 2000px)', width: '3000' },
      { media: '(min-width: 1200px)', width: '2000' },
      { media: '(min-width: 900px)', width: '1200' },
      { media: '(min-width: 600px)', width: '900' },
      { media: '(min-width: 450px)', width: '600' },
      { width: '600' },
    ]);
    picture.querySelector('img').height = height;
    picture.querySelector('img').width = width;
    const authorName = imageDetails._embedded.owner.display_name;
    const authorImage = (imageDetails._embedded.owner._links.images)[0].href;
    if (authorName) picture.dataset.authorName = authorName;
    if (authorImage) picture.dataset.authorImage = authorImage;
    return picture;
  }
  return null;
}

export default async function decorate(block) {
  const assetIds = [...block.querySelectorAll('p')].map((p) => p.textContent.trim());
  block.innerHTML = '';
  const imageContainer = createTag('div', { class: 'image-container' });
  // Get the first image in quickly and then process the rest
  const firstAssetId = assetIds[0];
  const firstPicture = await createPitcureFromAssetId(firstAssetId, true, true, 'high');
  if (firstPicture !== null) imageContainer.append(firstPicture);
  block.append(imageContainer);
  await waitForLCP();
  const parent = block.parentElement;
  const heading = parent.querySelector('h1');
  const contentContainer = createTag('div', { class: 'content-container' });
  contentContainer.append(heading);
  parent.querySelector('div.content').remove();
  block.append(contentContainer);
  const form = createTag('div', { class: 'generate-form' });
  const input = createTag('span', { contenteditable: 'true', class: 'generate-input' });
  input.textContent = await getI18nValue('prompt-bar-placeholder-text');
  const generateButton = createTag('button', { class: 'generate-button' });
  generateButton.textContent = await getI18nValue('prompt-bar-generate-button-title');
  form.append(input, generateButton);
  contentContainer.append(form);
  const author = createTag('div', { class: 'author' });
  block.append(author);
  generateButton.addEventListener('click', () => {
    textToImage(block);
    const analyticsEvent = makeFinalPayload({
      eventType: 'click',
      eventSubtype: 'Generate',
    });
    ingestAnalytics(analyticsEvent);
  });

  setTimeout(() => {
    // Get the rest of the images
    assetIds.forEach(async (assetId, i) => {
      if (i !== 0) {
        const picture = await createPitcureFromAssetId(assetId, false, false, 'high');
        if (picture !== null) imageContainer.append(picture);
      }
    });
    block.classList.add('type-started');
    animate(block, true);
  }, 3000);
}
