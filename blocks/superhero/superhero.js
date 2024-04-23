import { getLibs } from '../../scripts/utils.js';

const { createTag } = await import(`${getLibs()}/utils/utils.js`);

let index = 0;
let isAdding = true;

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

export default function decorate(block) {
  const rows = block.querySelectorAll(':scope > div');
  block.innerHTML = '';
  const imageContainer = createTag('div', { class: 'image-container' });
  rows.forEach((row, i) => {
    const cols = [...row.children];
    const image = cols[0].querySelector('a').href;
    const altText = cols[1].textContent;
    const img = createTag('img', { src: image, alt: altText });
    if (i === 0) {
      img.setAttribute('eager', true);
      img.classList.add('active');
    }
    imageContainer.append(img);
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
  setTimeout(() => {
    animate(block);
  }, 2000);
}
