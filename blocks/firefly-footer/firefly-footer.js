/* eslint-disable no-underscore-dangle */
import { getLibs } from '../../scripts/utils.js';

const { getMetadata, decorateSVG } = await import(`${getLibs()}/utils/utils.js`);

export default async function decorate(block) {
  const footerMeta = getMetadata('footer-source');
  const footerPath = footerMeta ? new URL(footerMeta, window.location).pathname : '/footer';

  if (footerPath) {
    const resp = await fetch(`${footerPath}.plain.html`);

    if (resp.ok) {
      const html = await resp.text();
      const tempDiv = document.createElement('div');
      tempDiv.innerHTML = html;

      const footerLinks = tempDiv.querySelectorAll('a');
      footerLinks.forEach((link) => {
        decorateSVG(link);
      });

      block.innerHTML = tempDiv.innerHTML;
    }
  }
}
