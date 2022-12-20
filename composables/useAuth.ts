import auth0, { Auth0UserProfile } from "auth0-js";
import Cookies from "js-cookie";

const userData = ref<Auth0UserProfile | null>(null);
const auth = ref<auth0.WebAuth | null>(null);

const useAuth = () => {
	const config = useRuntimeConfig();
	const AUTH_DOMAIN = config.public.auth0.AUTH_DOMAIN; // DOMAUN from https://auth0.com/ application
	const AUTH_CLIENTID = config.public.auth0.AUTH_CLIENTID; // CLIENTID from https://auth0.com/ application

	if (!AUTH_DOMAIN || !AUTH_CLIENTID) {
		console.error(
			"runtimeConfig.public.auth0.AUTH_DOMAIN & runtimeConfig.public.auth0.AUTH_DOMAIN are required to be set in nuxt.config, for useAuth to work"
		);
	} else if (!auth.value) {
		try {
			auth.value = new auth0.WebAuth({
				domain: AUTH_DOMAIN,
				clientID: AUTH_CLIENTID,
				scope: "email profile openid",
			});
		} catch (error) {
			console.error(error);
		}
	}

	const isLoggedIn = computed(() => !!userData.value);
	/**
	 * Logout user
	 */
	const logout = () => {
		Cookies.remove("auth._token.auth0");
		auth.value!.logout({});
		userData.value = null;
	};

	/**
	 * Set userData from token recieved in login functions
	 */
	const setUserDataFromToken = (token: string) => {
		auth.value!.client.userInfo(token, (error, user) => {
			if (error) {
				console.error(error);
			}
			if (user) {
				userData.value = user;
			}
		});
	};

	/**
	 * Set cookie from token recieved in login functions
	 */
	const setAuthCookie = (token: string) => {
		Cookies.set("auth._token.auth0", "Bearer " + token);
	};

	/**
	 * LOGIN WITH GOOGLE
	 */
	const loginGoogle = ({
		domain,
		redirectUri,
	}: {
		domain: string;
		redirectUri: string;
	}) => {
		return new Promise((resolve, reject) => {
			auth.value!.popup.authorize(
				{
					owp: true,
					connection: "google-oauth2",
					responseType: "token",
					nonce: "nonce",
					state: "state",
					domain,
					redirectUri,
				},
				(error, authResult) => {

					if (authResult.accessToken) {
						auth.value!.client.userInfo(
							authResult.accessToken,
							(error, result) => {
								if (error) {
									reject(error);
								}
								if (result && authResult.accessToken) {
									setUserDataFromToken(
										authResult.accessToken
									);
									setAuthCookie(authResult.accessToken);
									resolve(userData.value);
								}
							}
						);
					} else {
						reject(error);
					}
				}
			);
		});
	};

	/**
	 * SEND RESET PASSWORD MAIL
	 */

	const forgotPassword = (forgotPasswordMail: string) => {
		return new Promise((resolve, reject) => {
			auth.value!.changePassword(
				{
					email: forgotPasswordMail,
					connection: "Username-Password-Authentication",
				},
				(error, result) => {
					if (error) {
						reject(error);
					}
					if (result) {
						resolve(result);
					}
				}
			);
		});
	};

	/**
	 * LOGIN WITH MAIL AND PASSWORD
	 * N.B. On redirect page -> use processHash function to login user from the return url hash
	 */
	const loginLocal = (
		loginEmail: string,
		loginPassword: string,
		redirectUri: string
	) => {
		return new Promise((resolve, reject) => {
			auth.value!.login(
				{
					email: loginEmail,
					password: loginPassword,
					realm: "Username-Password-Authentication",
					redirectUri,
					responseType: "token",
					nonce: "nonce",
					state: "state",
				},
				(error, result) => {
					if (error) {
						reject(error);
					}
					if (result) {
						resolve(result);
					}
				}
			);
		});
	};

	/**
	 * REGISETR A USER
	 */
	const register = async (
		registerEmail: string,
		registerPassword: string
	) => {
		return new Promise((resolve, reject) => {
			auth.value!.signup(
				{
					email: registerEmail,
					password: registerPassword,
					connection: "Username-Password-Authentication",
				},
				async (error, result) => {
					if (error) {
						reject(error);
					}
					if (result) {
						resolve(result);
					}
				}
			);
		});
	};

	// GET ACCESS TOKEN FROM HASH AFTER LOGIN REDIRCET
	/**
	 * EXAMPLE USE
	 *
	 * onMounted(() => {
	 * 		const hash = route.hash;
	 * 		if (hash) {
	 * 			processHash(hash);
	 * 		}
	 * }
	 */
	const processHash = (hash: string) => {
		auth.value!.parseHash(
			{ hash, nonce: "nonce", state: "state" },
			(error, result) => {
				if (error) {
					console.error(error);
				}
				if (result && result.accessToken) {
					setAuthCookie(result.accessToken);
					setUserDataFromToken(result.accessToken);
				}
			}
		);
	};

	/**
	 * Set user from cookie
	 */
	const setUserFromCookie = () => {
		let loginToken: string | undefined = Cookies.get("auth._token.auth0");
		if (loginToken) {
			loginToken = loginToken.replace("Bearer ", "");
			setUserDataFromToken(loginToken);
		}
	};

	onMounted(() => {
		setUserFromCookie();
	});

	return {
		isLoggedIn,
		userData,
		logout,
		processHash,
		register,
		loginLocal,
		forgotPassword,
		loginGoogle,
	};
};
export default useAuth;
