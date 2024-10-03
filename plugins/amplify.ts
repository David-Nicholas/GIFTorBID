import { Amplify } from 'aws-amplify'

export default defineNuxtPlugin(nuxtApp => {
  const config = useRuntimeConfig().public;


  Amplify.configure({
    Auth: {
      Cognito: {
        userPoolClientId: config.auth_userpool_clientid,
        userPoolId: config.auth_userpool_id,
        loginWith: {
          oauth: {
            domain: config.oauth_domain,
            scopes: ['email', 'openid', 'phone'],
            redirectSignIn: [config.deployment_url],
            redirectSignOut: [config.deployment_url],
            responseType: 'token',
          },
        },
      },
    },
  });

  return {
    provide: {
      auth: Amplify
    }
  };
});