export function initAnalytics() {
  console.log('Analytics initialized');
}

export function ingestAnalytics(eventPayload) {
  console.log('Sending analytics event:', eventPayload);
}

export function createAnalyticsEvent({
  timestamp = new Date().toISOString(),
  ...data
}) {
  const project = 'genai-web-service';
  const environment = 'stage';
  const ingesttype = 'dunamis';
  return {
    project,
    environment,
    time: timestamp,
    ingesttype,
    data,
  };
}
