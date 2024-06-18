export default async function decorate(block) {
  const heroPic = block.querySelector('picture');
  heroPic.parentElement.replaceWith(heroPic);
  const legalContent = document.createElement('div');
  legalContent.classList.add('legal-content');
  const p = block.querySelectorAll('p');
  const h4 = block.querySelector('h4');
  legalContent.append(h4);
  legalContent.append(...p);
  const legalFooter = document.createElement('div');
  legalFooter.classList.add('legal-footer');
  const cancel = document.createElement('button');
  cancel.classList.add('cancel');
  cancel.textContent = 'Cancel';
  cancel.addEventListener('click', () => {
    block.remove();
  });
  const agree = document.createElement('button');
  agree.classList.add('agree');
  agree.textContent = 'Agree';
  agree.addEventListener('click', () => {
    block.remove();
  });
  legalFooter.append(cancel);
  legalFooter.append(agree);
  block.append(legalContent);
  block.append(legalFooter);
}
