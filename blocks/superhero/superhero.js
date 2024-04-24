import { getLibs } from '../../scripts/utils.js';

const { createTag } = await import(`${getLibs()}/utils/utils.js`);
const SUPERHERO_CONTENT = 'content.json';
const SUPERHERO_BASE_URL = 'https://clio-assets.adobe.com/clio-playground/super-hero-prod-v3/v0/';
const TEXT_TO_IMAGE_BASE_URL = 'https://firefly.adobe.com/community/view/texttoimage?id=';
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

function animate(block) {
  const active = block.querySelector('img.active');
  const input = block.querySelector('.generate-input');
  const next = active.nextElementSibling || block.querySelector('img');
  const nextText = next.alt;
  active.classList.remove('active');
  next.classList.add('active');
  input.textContent = '';
  typeAnimation(input, nextText, block);
}

export default async function decorate(block) {
  const link = block.querySelector('a') || (SUPERHERO_BASE_URL + SUPERHERO_CONTENT);
  block.innerHTML = '';
  const resp = await fetch(link.href);
  if (!resp.ok) {
    return;
  }
  const respJson = await resp.json();
  if (respJson && respJson.items && respJson.items.length > 0) {
    const images = respJson.items;
    const imageContainer = createTag('div', { class: 'image-container' });
    images.forEach((image, i) => {
      if (image.image.url && image.prompt.defaultMessage && image.docId) {
        const img = createTag('img', {
          src: SUPERHERO_BASE_URL + image.image.url,
          alt: image.prompt.defaultMessage,
          id: image.docId,
        });
        if (i === 0) {
          img.setAttribute('eager', true);
          img.classList.add('active');
        }
        imageContainer.append(img);
      }
    });
    block.append(imageContainer);
  }
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
    animate(block);
  }, 2000);
}
