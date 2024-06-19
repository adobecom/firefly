# Firefly on AEM Edge Delivery Services
Use this project to develop for the AEM Edge Delivery site for firefly.adobe.com

## Steps
1. Add the project to the [Helix Sidekick](https://github.com/adobe/helix-sidekick).
2. Start creating your content.

## Developing
1. Install the [Helix CLI](https://github.com/adobe/helix-cli): `sudo npm install -g @adobe/helix-cli`
1. Run `hlx up` this repo's folder. (opens your browser at `http://localhost:3000`)
1. Open this repo's folder in your favorite editor and start coding.

### IMS / Analytics related development
You need to be on VPN and you need to use the following instructions to setup https://localhost.adobe.com for both IMS and Analytics integrations

https://main--milo--adobecom.hlx.page/docs/engineering/running-milo-locally-decom (last tab at the bottom)

### Susi Light / Sign In button override
To install the latest from @sentry-wrapper, you need to be on VPN and:

You need something like this in your .npmrc file:
`@sentry:registry=https://artifactory.corp.adobe.com/artifactory/api/npm/npm-sentry-release/

//artifactory.corp.adobe.com/:_authToken=%TOKEN%`

Replace %TOKEN% with the token you have, or if you need a new one:
Go to artifactory
Click sign in
Click your name in the top right corner
Click Edit Profile
Click Generate an identity token
Take the generated token and replace %TOKEN% in your .npmrc

## Testing
```sh
npm run test
```
or:
```sh
npm run test:watch
```
This will give you several options to debug tests. Note: coverage may not be accurate.

## Security
1. Create a Service Now ID for your project via [Service Registry Portal](https://adobe.service-now.com/service_registry_portal.do#/search)
2. Update the `.kodiak/config.yaml` file to make sure valid team members are assigned security vulnerability Jira tickets.
