import { createOptimizedFireflyPicture } from '../../scripts/utils.js';
import { decorateI18n } from '../../scripts/scripts.js';

export default async function decorate(block) {
  /* change to ul, li */
  const ul = document.createElement('ul');
  [...block.children].forEach((row) => {
    const li = document.createElement('li');
    while (row.firstElementChild) {
      const col = row.firstElementChild;
      if (col.querySelector('picture')) {
        col.className = 'cards-card-image';
        col.querySelectorAll('picture').forEach((picture, idx) => {
          const img = picture.querySelector('img');
          const replacedPicture = createOptimizedFireflyPicture(img.src, img.alt, false, [{ width: '750' }]);
          picture.replaceWith(replacedPicture);

          if (idx === 0) {
            replacedPicture.classList.add('card-bg-image');
          } else {
            replacedPicture.classList.add('card-fg-image');
          }

          if (replacedPicture.parentElement.tagName === 'P' && replacedPicture.parentElement.childElementCount === 1) {
            const par = replacedPicture.parentElement;
            par.before(replacedPicture);
            par.remove();
          }
        });
      } else col.className = 'cards-card-body';
      li.append(col);
    }

    const anchor = li.querySelector('a');
    if (anchor && anchor.href) {
      li.classList.add('linked-card');
      li.addEventListener('click', () => {
        document.location.href = anchor.href;
      });
    }

    ul.append(li);
  });
  block.replaceChildren(ul);
  await decorateI18n(block);
}
