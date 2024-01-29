<template>
	<div id="app" class="h-screen">
		<HomeHeader />
		<router-view />

		<MainFooter />
	</div>
</template>

<script>
import HomeHeader from './components/HomeHeader.vue';
import MainFooter from './components/MainFooter.vue';
export default {
	name: 'App',
	components: { HomeHeader, MainFooter },
};
</script>

<style src="./assets/main.css"></style>
