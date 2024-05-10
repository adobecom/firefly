/* eslint-disable quote-props */
/* eslint-disable no-underscore-dangle */
import { getLibs } from '../../scripts/utils.js';

const { createTag } = await import(`${getLibs()}/utils/utils.js`);
const GALLERY_URL = 'https://community-hubs.adobe.io/api/v2/ff_community/assets?sort=updated_desc&include_pending_assets=false&size=';
const COMMUNITY_URL = 'https://firefly.adobe.com/community/view/texttoimage?id=';
const DEFAULT_FORMAT = 'jpg';
const DEFAULT_DIMENSION = 'width';
const DEFAULT_SIZE = '350';
const SHORT_GALLERY_SIZE = '20';
const FULL_GALLERY_SIZE = '48';
const GRID_GAP = 10;
const GRID_ROW_HEIGHT = 10;
let totalImages = 0;
let cursor;
let GETTING_IMAGES = false;

function resizeGridItem(item) {
  const rowSpan = Math.ceil((item.querySelector('img').height + GRID_GAP) / (GRID_ROW_HEIGHT + GRID_GAP));
  item.style.gridRowEnd = `span ${rowSpan}`;
}

function resizeAllGridItems(block) {
  const cards = block.querySelectorAll('.card');
  for (let i = 0; i < cards.length; i += 1) {
    resizeGridItem(cards[i]);
  }
}

async function getImages(link, next = '') {
  let endpoint = link;
  // const requestId = (Math.random() + 1).toString(36).substring(5);
  const headers = new Headers({
    'X-Api-Key': 'alfred-community-hubs',
    'community_id': 'ff_community',
  });
  if (cursor !== null && cursor !== '') endpoint += `&cursor=${encodeURIComponent(next)}`;
  const resp = await fetch(endpoint, {
    headers,
    mode: 'cors',
  });
  if (!resp.ok) {
    return [];
  }
  const respJson = await resp.json();
  if ((totalImages === 0) && respJson && respJson.total) {
    totalImages = respJson.total;
  }
  if (respJson && respJson._links && respJson._links.next) {
    const nextLink = new URL(respJson._links.next.href);
    cursor = nextLink.searchParams.get('cursor');
  }
  if (respJson && respJson._embedded.assets && respJson._embedded.assets.length > 0) {
    return respJson._embedded.assets;
  }
  return [];
}

async function addCards(cardContainer, images) {
  await images.forEach((image) => {
    const rendition = image._links.rendition.href;
    const maxWidth = image._links.rendition.max_width;
    const maxHeight = image._links.rendition.max_height;
    const aspectRatio = (maxWidth / maxHeight).toFixed(2);
    const height = (DEFAULT_SIZE / aspectRatio).toFixed(2);
    const authorName = image._embedded.owner.display_name;
    const authorImage = image._embedded.owner._links.images[0].href;
    const imageUrn = image.urn;
    const prompt = image.title;
    const imageUrl = rendition.replace('{format}', DEFAULT_FORMAT).replace('{dimension}', DEFAULT_DIMENSION).replace('{size}', DEFAULT_SIZE);
    const communityUrl = COMMUNITY_URL + imageUrn;
    if (imageUrl && prompt && authorName && authorImage && communityUrl) {
      const img = createTag('img', {
        src: imageUrl,
        alt: prompt,
        id: imageUrn,
        width: DEFAULT_SIZE,
        height,
      });
      const card = createTag('div', { class: 'card' });
      card.append(img);
      const rowSpan = Math.ceil((height + GRID_GAP) / (GRID_ROW_HEIGHT + GRID_GAP));
      card.style.gridRowEnd = `span ${rowSpan}`;
      const cardDetails = createTag('div', { class: 'card-details' });
      const author = createTag('div', { class: 'author' });
      const authorImg = createTag('img', {
        src: authorImage,
        alt: authorName,
      });
      author.append(authorImg);
      author.append(authorName);
      const cardPrompt = createTag('div', { class: 'prompt' });
      cardPrompt.innerHTML = prompt;
      const viewLink = createTag('a', {
        href: communityUrl,
        class: 'viewLink button',
      });
      viewLink.textContent = 'View';
      const favorite = createTag('button', { class: 'favorite' });
      const viewButton = createTag('button', { class: 'view' });
      viewButton.append(viewLink);
      const cardFooter = createTag('div', { class: 'card-footer' });
      cardFooter.append(favorite);
      cardFooter.append(viewButton);
      cardDetails.append(author);
      cardDetails.append(cardPrompt);
      cardDetails.append(cardFooter);
      card.append(cardDetails);
      cardContainer.append(card);
    }
  });
  GETTING_IMAGES = false;
}

export default async function decorate(block) {
  let size = SHORT_GALLERY_SIZE;
  let IS_INFINITE_SCROLL = false;
  if (block.classList.contains('full')) {
    IS_INFINITE_SCROLL = true;
    size = FULL_GALLERY_SIZE;
  }
  const link = block.querySelector('a')?.href || `${GALLERY_URL}${size}`;
  block.innerHTML = '';
  const images = await getImages(link);
  const cardContainer = createTag('div', { class: 'card-container' });
  await addCards(cardContainer, images);
  block.append(cardContainer);
  resizeAllGridItems(block);
  window.addEventListener('resize', resizeAllGridItems(block));
  if (IS_INFINITE_SCROLL) {
    // if last card is visible, fetch more images
    setTimeout(() => {
      const intersectionContainer = block.querySelector('.card-container .card:last-child');
      const observer = new IntersectionObserver(async (entries) => {
        if (entries[0].isIntersecting) {
          if (GETTING_IMAGES) return;
          GETTING_IMAGES = true;
          observer.unobserve(intersectionContainer);
          const containerEl = block.querySelector('.card-container');
          if (containerEl.children.length < totalImages) {
            // fetch more images if there are more images to fetch
            const nextImages = await getImages(link, cursor);
            if (nextImages.length === 0) {
              observer.unobserve(intersectionContainer);
              return;
            }
            await addCards(cardContainer, nextImages);
            const newIntersectionContainer = block.querySelector('.card-container .card:last-child');
            observer.observe(newIntersectionContainer);
          } else {
            observer.unobserve(intersectionContainer);
          }
        }
      }, { threshold: 1 });
      observer.observe(intersectionContainer);
    }, 2000);
  }
}
