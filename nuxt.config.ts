// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
	runtimeConfig: {
		public: {
			auth0: {
				AUTH_DOMAIN: process.env.AUTH_DOMAIN,
				AUTH_CLIENTID: process.env.AUTH_CLIENTID,
			},
		},
	},
});
