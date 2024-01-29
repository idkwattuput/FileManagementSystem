<template>
	<nav class="flex items-center justify-between p-6">
		<div>
			<p class="text-5xl">Saja</p>
		</div>
		<div class="flex items-center justify-center gap-4">
			<router-link to="/login" class="px-4 py-2 rounded bg-sky-500 text-sky-100">Login</router-link>
			<router-link to="/register" class="px-4 py-2 rounded border-3 bg-sky-100 border-sky-800 text-sky-800">Register</router-link>
		</div>
	</nav>
</template>

<script>
export default {
	name: 'HomeHeader',
};
</script>
