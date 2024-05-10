import { createOptimizedFireflyPicture } from '../../scripts/utils.js';

export default function decorate(block) {
  /* change to ul, li */
  const ul = document.createElement('ul');
  [...block.children].forEach((row) => {
    const li = document.createElement('li');
    while (row.firstElementChild) li.append(row.firstElementChild);
    [...li.children].forEach((div) => {
      if (div.children.length >= 1 && div.querySelector('picture')) div.className = 'cards-card-image';
      else div.className = 'cards-card-body';
    });
    ul.append(li);
  });
  ul.querySelectorAll('img').forEach((img) => img.closest('picture').replaceWith(createOptimizedFireflyPicture(img.src, img.alt, false, [{ width: '750' }])));
  block.textContent = '';
  block.append(ul);

  // Full card should be clickable
  block.querySelectorAll('.cards > ul > li').forEach((card) => {
    const anchor = card.querySelector('a');
    if (anchor && anchor.href) {
      const alink = anchor.href;
      card.classList.add('linked-card');

      card.addEventListener('click', () => {
        document.location.href = alink;
      });
    }
  });
}
