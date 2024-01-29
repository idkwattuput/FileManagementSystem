<template>
	<div class="flex flex-col max-w-xl gap-4 p-4 m-auto rounded-md border-slate-400">
		<h1 class="text-4xl">Register</h1>
		<form @submit.prevent="registerUser" class="flex flex-col gap-4">
			<div class="flex flex-col">
				<label for="name">Name:</label>
				<input type="text" v-model="name" required class="px-2 border rounded border-slate-400" />
			</div>
			<div class="flex flex-col">
				<label for="email">Email:</label>
				<input type="email" v-model="email" required class="px-2 border rounded border-slate-400" />
			</div>
			<div class="flex flex-col">
				<label for="password">Password:</label>
				<input type="password" v-model="password" required class="px-2 border rounded border-slate-400" />
			</div>
			<div class="flex flex-col">
				<label for="confirmPassword">Confirm Password:</label>
				<input type="password" v-model="confirmPassword" required class="px-2 border rounded border-slate-400" />
			</div>
			<button type="submit" class="px-4 py-2 rounded bg-sky-500 text-sky-100">Register</button>
		</form>
	</div>
</template>

<script>
export default {
	data() {
		return {
			name: '',
			email: '',
			password: '',
			confirmPassword: '',
		};
	},
	methods: {
		async registerUser() {
			// Call your backend API to register the user
			try {
				const response = await fetch('http://localhost:5000/user', {
					method: 'POST',
					headers: {
						'Content-Type': 'application/json',
					},
					body: JSON.stringify({
						name: this.name,
						email: this.email,
						password: this.password,
						confirmPassword: this.confirmPassword,
					}),
				});

				const data = await response.json();

				if (response.ok) {
					console.log('User registered successfully:', data);
					// Optionally, you can redirect the user to the login page or perform other actions.
				} else {
					console.error('Registration failed:', data.message);
					// Handle the error and provide feedback to the user.
				}
			} catch (error) {
				console.error('Error during registration:', error);
				// Handle unexpected errors, such as network issues.
			}
		},
	},
};
</script>
