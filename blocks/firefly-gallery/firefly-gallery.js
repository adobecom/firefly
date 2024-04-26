/* eslint-disable no-underscore-dangle */
import { getLibs } from '../../scripts/utils.js';

const { createTag } = await import(`${getLibs()}/utils/utils.js`);
const GALLERY_URL = 'https://community-hubs.adobe.io/api/v2/ff_community/assets?sort=updated_desc&include_pending_assets=false&size=';
const COMMUNITY_URL = 'https://firefly.adobe.com/community/view/texttoimage?id=';
const DEFAULT_FORMAT = 'jpg';
const DEFAULT_DIMENSION = 'width';
const DEFAULT_SIZE = '350';
const SHORT_GALLERY_SIZE = '20';
// const FULL_GALLERY_SIZE = '48';

export default async function decorate(block) {
  const link = block.querySelector('a') || GALLERY_URL + SHORT_GALLERY_SIZE;
  block.innerHTML = '';
  let resp = await fetch(link.href);
  if (!resp.ok) {
    resp = await fetch('/blocks/firefly-gallery/assets-sample.json');
  }
  const respJson = await resp.json();
  if (respJson && respJson._embedded.assets && respJson._embedded.assets.length > 0) {
    const images = respJson._embedded.assets;
    const cardContainer = createTag('div', { class: 'card-container' });
    images.forEach((image) => {
      const rendition = image._links.rendition.href;
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
        });
        const card = createTag('div', { class: 'card' });
        card.append(img);
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
        const likeButton = createTag('button', { class: 'like button' });
        likeButton.textContent = 'Like';
        const cardFooter = createTag('div', { class: 'card-footer' });
        cardFooter.append(likeButton);
        cardFooter.append(viewLink);
        cardDetails.append(author);
        cardDetails.append(cardPrompt);
        cardDetails.append(cardFooter);
        card.append(cardDetails);
        cardContainer.append(card);
      }
    });
    block.append(cardContainer);
  }
}
