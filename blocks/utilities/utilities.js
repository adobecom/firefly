import { decorateButtons } from '../../scripts/aem.js';

export default async function decorate(block) {
  decorateButtons(block);
  console.log('Decorating block', block);
  const navItemWrapper = document.createElement('div');
  const children = block.querySelectorAll('p');
  children.forEach((p) => {
    const navItem = document.createElement('div');
    navItem.classList.add('feds-navItem');
    const a = p.querySelector('a');
    // remove all classes of a and add
    const ul = p.nextElementSibling;
    if (ul && ul.tagName === 'UL') {
      const button = document.createElement('button');
      button.classList.add('feds-navLink', 'feds-navLink--hoverCaret');
      button.setAttribute('aria-expanded', 'false');
      button.setAttribute('aria-haspopup', 'true');
      button.setAttribute('daa-lh', 'header|Open');
      button.textContent = a.textContent;
      const ulWrapper = document.createElement('div');
      ulWrapper.classList.add('feds-popup');
      const fedsMenuContent = document.createElement('div');
      fedsMenuContent.classList.add('feds-menu-content');
      const fedsMenuColumn = document.createElement('div');
      fedsMenuColumn.classList.add('feds-menu-column');
      fedsMenuColumn.append(ul);
      fedsMenuContent.append(fedsMenuColumn);
      ulWrapper.append(fedsMenuContent);
      navItem.append(button, ulWrapper);
    }
    if (a) {
      navItem.append(a);
    }
    navItemWrapper.append(navItem);
  });
  block.replaceChildren(navItemWrapper);
  const utilsWrapper = document.querySelector('.feds-utilities');
  if (utilsWrapper) {
    utilsWrapper.prepend(...navItemWrapper.childNodes);
  }
  block.remove();
}
