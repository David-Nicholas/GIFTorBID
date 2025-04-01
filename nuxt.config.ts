import { defineNuxtConfig } from "nuxt/config";
import { createResolver } from "@nuxt/kit";
const { resolve } = createResolver(import.meta.url);
export default defineNuxtConfig({
  compatibilityDate: '2024-04-03',
  app: {
    pageTransition: { name: "page", mode: "out-in" },
  },
  devtools: { enabled: true },
  modules: ['@nuxt/ui',
    "@nuxtjs/tailwindcss", 
  ],
  components: [
    {
      path: resolve("./components/"),
      global: true,
    },
  ],
  runtimeConfig:{
    public:{
      deployment_url: process.env.DEPLOYMENT_URL,

      auth_region: process.env.AUTH_REGION,
      auth_userpool_id: process.env.AUTH_USERPOOL_ID,
      auth_userpool_clientid: process.env.AUTH_USERPOOL_CLIENTID,
      auth_userpool_endpoint: process.env.AUTH_USERPOOL_ENDPOINT,

      oauth_clientid: process.env.OAUTH_CLIENTID,
      oauth_domain: process.env.OAUTH_DOMAIN,

      api_url: process.env.API_URL,
      web_socket_url: process.env.WEB_SOCKET_URL
    }
  }
})