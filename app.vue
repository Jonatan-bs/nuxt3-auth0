<script setup>
const {
	forgotPassword,
	loginGoogle,
	isLoggedIn,
	loginLocal,
	logout,
	processHash,
	register,
	userData,
} = useAuth();

const mail = ref("");
const password = ref("");
const route = useRoute();

onMounted(() => {
	//  On local login user is redirected to same page with hash in url
	//  Check hash and login
	const hash = route.hash;
	if (hash) {
		processHash(hash);
	}
});
</script>

<template>
	<div>
		<p>isLoggedIn: {{ isLoggedIn }}</p>

		<p>userData: {{ userData }}</p>

		<button @click="loginGoogle">loginGoogle</button><br />
		<br />

		<label>
			Name
			<input type="text" v-model="mail" aria-label="mail" /> </label
		><br />
		<label>
			Password
			<input type="password" v-model="password" aria-label="password"
		/></label>

		<button @click="forgotPassword(mail)">forgotPassword</button><br />

		<button @click="loginLocal(mail, password, 'http://localhost:3000/')">
			login</button
		><br />

		<button @click="register(mail, password)">register</button><br />

		<button @click="logout">logout</button>
	</div>
</template>
