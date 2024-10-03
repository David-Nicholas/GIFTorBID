// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  compatibilityDate: '2024-04-03',
  devtools: { enabled: true },
  modules: ['@nuxtjs/tailwindcss'],
  runtimeConfig:{
    public:{
      deployment_url: process.env.DEPLOYMENT_URL,

      auth_region: process.env.AUTH_REGION,
      auth_userpool_id: process.env.AUTH_USERPOOL_ID,
      auth_userpool_clientid: process.env.AUTH_USERPOOL_CLIENTID,
      auth_userpool_endpoint: process.env.AUTH_USERPOOL_ENDPOINT,

      oauth_clientid: process.env.OAUTH_CLIENTID,
      oauth_domain: process.env.OAUTH_DOMAIN,
    }
  }
})