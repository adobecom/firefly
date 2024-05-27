import { getLibs } from '../../scripts/utils.js';

const { createTag } = await import(`${getLibs()}/utils/utils.js`);

export default function decorate(block) {
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
  // Replace the video links with videos
  [...content.children].forEach((row) => {
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
}
