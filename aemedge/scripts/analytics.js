/* eslint-disable no-console */
import { getMetadata } from './aem.js';

export function initAnalytics() {
  const DUNAMIS_API_URL_STAGE = 'https://cc-api-data-stage.adobe.io/ingest';
  const DUNAMIS_API_URL_PROD = 'https://cc-api-data.adobe.io/ingest';
  const DUNAMIS_PROJECT_KEY = 'genai-web-service';
  const DUNAMIS_API_KEY = 'genai-web-service';

  const buildMode = getMetadata('buildmode');

  let url;
  if (buildMode === 'prod') {
    url = DUNAMIS_API_URL_PROD;
  } else if (buildMode === 'stage') {
    url = DUNAMIS_API_URL_STAGE;
  }

  window.analyticsConfig = {
    apiUrl: url,
    projectKey: DUNAMIS_PROJECT_KEY,
    apiKey: DUNAMIS_API_KEY,
  };
}

export function ingestAnalytics(eventPayload) {
  const headers = new Headers({
    'Content-Type': 'application/json',
    'x-api-key': window.analyticsConfig.apiKey,
  });

  const payload = { events: eventPayload };

  fetch(window.analyticsConfig.apiUrl, {
    method: 'POST',
    headers,
    body: JSON.stringify(payload),
  })
    .then((response) => {
      if (!response.ok) {
        throw new Error(`Network response was not ok ${response.statusText}`);
      }

      if (response.headers.get('Content-Length') === '0') {
        return {};
      }

      return response;
    })
    .catch((error) => {
      console.error('There was a problem with the fetch operation:', error);
    });
}

const sanitizeUrl = (urlString) => {
  const url = new URL(urlString);
  const { hash } = url;
  if (hash.includes('access_token')) {
    return `${url.origin}${url.pathname}${url.search}`;
  }
  return urlString;
};

const INGEST_BASE_PAYLOAD = {
  project: 'genai-web-service',
  environment: 'stage',
  ingesttype: 'dunamis',
  time: new Date().toISOString(),
};

const INGEST_BASE_DATA_EVENT = {
  'event.category': 'WEB',
  'event.workflow': 'Playground', // need to ask about this
  'event.user_agent': navigator.userAgent,
  'event.offline': false,
};

const INGEST_BASE_DATA_SOURCE = {
  'source.client_id': 'clio-playground-web',
  'source.name': 'GenAI Playground',
  'source.version': '1.0.8',
  'source.platform': 'WEB',
};

const INGEST_BASE_DATA_USER = { 'user.service_code': 'creativecloud' };
const INGEST_BASE_DATA_ENV = { 'env.com.name': 'GenAI Playground' };
const INGEST_BASE_DATA_CONTEXT = { 'context.init': false };
const INGEST_BASE_DATA_UI = { 'ui.view_type': '' };

const getComputedEventValues = (sessionGUID) => ({
  'event.referrer': document.referrer, // probably should not be in base props.
  'event.url': sanitizeUrl(document.location.href), // probably should not be in base props
  'event.coll_dts': new Date().toString(),
  'event.dts_start': new Date().toString(),
  'event.dts_end': new Date().toString(),
  'event.session_guid': sessionGUID,
  'event.language': window.adobeIMS?.adobeIdData?.locale.replace('_', '-') || 'en-US',
});

const getComputedContextValues = () => ({ 'context.init': false });
const getComputedIMSValues = () => ({ 'user.service_code': window.adobeIMS?.serviceRequest?.scope || '' });

const getComputedContentValues = () => ({
  'content.name': '',
  'content.category': '',
  'content.type': '',
});

export function makeFinalPayload({ ...events }) {
  return {
    ...INGEST_BASE_PAYLOAD,
    data: {
      ...INGEST_BASE_DATA_EVENT,
      ...INGEST_BASE_DATA_SOURCE,
      ...INGEST_BASE_DATA_USER,
      ...INGEST_BASE_DATA_ENV,
      ...INGEST_BASE_DATA_CONTEXT,
      ...INGEST_BASE_DATA_UI,
      ...getComputedEventValues('SESSION GUID'),
      ...getComputedContextValues(),
      ...getComputedContentValues(),
      ...getComputedIMSValues(),
      ...events,
    },
  };
}

export function recordRenderPageEvent(pageSource, feedbackId) {
  const event = makeFinalPayload({
    'content.id': '',
    'content.name': feedbackId ?? '',
    'event.subcategory': pageSource,
    'event.subtype': 'page',
    'event.type': 'render',
  });
  ingestAnalytics([event]);
}
