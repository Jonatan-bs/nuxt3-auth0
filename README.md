# AUTH0 Setup for NUXT3 

1. Create an application in https://auth0.com/
2. In the application settings, find the domain and clientId and set the following properties in nuxt.config: runtimeConfig.public.auth0.AUTH_DOMAIN & runtimeConfig.public.auth0.AUTH_DOMAIN
3. Copy the useAuth composable and use it as it's used in app.vue
