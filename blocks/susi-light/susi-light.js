/* eslint-disable no-unused-vars */
/* eslint-disable import/no-unresolved */
// import { LitElement, html } from 'https://cdn.jsdelivr.net/gh/lit/dist@3/core/lit-core.min.js';
import { loadScript } from '../../scripts/aem.js';

export default async function decorate(block) {
  // block.innerHTML = '';
  // Load SUSI libraries here
  const susiSentry = document.createElement('susi-sentry');
  susiSentry.setAttribute('id', 'sentry');
  block.appendChild(susiSentry);
  // window.adobeid = {
  //   client_id: 'sentry-test',
  //   scope: 'AdobeID,openid',
  //   locale: 'en-us',
  // };
  // loadScript('https://auth.services.adobe.com/imslib/imslib.min.js');
  // loadScript('https://auth-light.identity-stage.adobe.com/sentry/edu-express.en-us.fc652747.js');
  // loadScript('https://auth-light.identity-stage.adobe.com/sentry/wrapper.js');
}
