<template>
	<div class="flex flex-col max-w-xl gap-4 p-4 m-auto rounded-md border-slate-400">
		<h1 class="text-4xl">Login</h1>
		<form @submit.prevent="loginUser" class="flex flex-col gap-4">
			<div class="flex flex-col">
				<label for="email">Email:</label>
				<input type="email" v-model="email" required class="px-2 border rounded border-slate-400" />
			</div>
			<div class="flex flex-col">
				<label for="password">Password:</label>
				<input type="password" v-model="password" required class="px-2 border rounded border-slate-400" />
			</div>
			<button type="submit" class="px-4 py-2 rounded bg-sky-500 text-sky-100">Login</button>
		</form>
	</div>
</template>

<script>
export default {
	data() {
		return {
			email: '',
			password: '',
		};
	},
	methods: {
		async loginUser() {
			try {
				const response = await fetch('http://localhost:5000/auth/login', {
					method: 'POST',
					headers: {
						'Content-Type': 'application/json',
					},
					credentials: 'include',
					body: JSON.stringify({
						email: this.email,
						password: this.password,
					}),
				});

				const data = await response.json();

				if (response.ok) {
					console.log('Login successful:', data);
					this.$router.push({ name: 'file' });
					// Optionally, you can redirect the user to another page or perform other actions.
				} else {
					console.error('Login failed:', data.message);
					// Handle the error and provide feedback to the user.
				}
			} catch (error) {
				console.error('Error during login:', error);
				// Handle unexpected errors, such as network issues.
			}
		},
	},
};
</script>
