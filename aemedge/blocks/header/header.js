// eslint-disable-next-line import/no-unresolved
import * as globalNav from 'https://main--milo--adobecom.hlx.live/libs/blocks/global-navigation/global-navigation.js';

export default async function decorate(block) {
  block.classList.add('global-navigation');
  // eslint-disable-next-line max-len
  // globalNav.CONFIG.universalNav.components.profile.attributes.callbacks.onSignIn = () => { window.adobeIMS?.signIn(); };
  await globalNav.default(block);
}
