<script setup lang="ts">
import { ref, onMounted, onUnmounted, watch } from 'vue';

const props = defineProps<{
    isKeyboardMode: boolean;
}>();

const emit = defineEmits<{
    (e: 'toggle-keyboard-mode', value: boolean): void;
}>();

// Watch for changes in keyboard mode and emit the event
const isKeyboardMode = ref(props.isKeyboardMode || false);
watch(isKeyboardMode, (newValue) => {
    emit('toggle-keyboard-mode', newValue);
});

const isMobile = ref(false);
const isMobileMenuOpen = ref(false);

const updateMobileStatus = () => {
    isMobile.value = window.innerWidth < 768;
    if (!isMobile.value) {
        isMobileMenuOpen.value = false;
    }
};

onMounted(() => {
    updateMobileStatus();
    window.addEventListener('resize', updateMobileStatus);
});

onUnmounted(() => {
    window.removeEventListener('resize', updateMobileStatus);
});

const toggleMobileMenu = () => {
    isMobileMenuOpen.value = !isMobileMenuOpen.value;
};
</script>

<template>
	<nav class="navigation-bar">
		<div class="nav-container">
			<div class="nav-brand">
				<div class="brand-icon">
					<svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
						<path
							d="M9.4 16.6L4.8 12l4.6-4.6L8 6l-6 6 6 6 1.4-1.4zm5.2 0L19.2 12l-4.6-4.6L16 6l6 6-6 6-1.4-1.4z"
						/>
					</svg>
				</div>
				<a href="/" class="logo">Code Review App</a>
			</div>

			<ul class="nav-links" :class="{ 'mobile-open': isMobileMenuOpen }">
				<li><a href="/" class="nav-link">Setup</a></li>
				<li><a class="nav-link">Project Overview</a></li>
				<li><a class="nav-link">Inspect Mode</a></li>
			</ul>

			<div class="keyboard-mode-toggle">
				<label class="toggle-label">
					<span class="toggle-text">Keyboard Mode</span>
					<input type="checkbox" class="toggle-checkbox" v-model="isKeyboardMode" />
					<span class="toggle-slider"></span>
				</label>
			</div>

			<button
				class="menu-toggle"
				v-if="isMobile"
				@click="toggleMobileMenu"
				:class="{ 'active': isMobileMenuOpen }"
			>
				<span class="hamburger-line"></span>
				<span class="hamburger-line"></span>
				<span class="hamburger-line"></span>
			</button>
		</div>
	</nav>
</template>

<style scoped>
.keyboard-mode-toggle {
    display: flex;
    align-items: center;
    gap: 8px;
    color: #cccccc;
    font-size: 14px;
}

.toggle-label {
    display: flex;
    align-items: center;
    cursor: pointer;
    user-select: none;
    font-size: larger;
}

.toggle-checkbox {
    display: none;
}

.toggle-slider {
    position: relative;
    width: 40px;
    height: 20px;
    background-color: #454545;
    border-radius: 20px;
    transition: background-color 0.3s ease;
    cursor: pointer;
}

.toggle-slider::before {
    content: '';
    position: absolute;
    top: 2px;
    left: 2px;
    width: 16px;
    height: 16px;
    background-color: #cccccc;
    border-radius: 50%;
    transition: transform 0.3s ease;
}

.toggle-checkbox:checked + .toggle-slider {
    background-color: #007acc;
}

.toggle-checkbox:checked + .toggle-slider::before {
    transform: translateX(20px);
}

.toggle-text {
    margin-right: 8px;
}

.navigation-bar {
	background-color: #2d2d30;
	border-bottom: 1px solid #3e3e42;
	min-height: 48px;
	height: 48px;
	position: sticky;
	top: 0;
	z-index: 1000;
	box-shadow: 0 1px 3px rgba(0, 0, 0, 0.3);
}

.nav-container {
	height: 100%;
	max-width: 100%;
	padding: 0 16px;
	display: flex;
	align-items: center;
	justify-content: space-between;
}

.nav-brand {
	display: flex;
	align-items: center;
	gap: 8px;
	flex-shrink: 0;
}

.brand-icon {
	color: #007acc;
	display: flex;
	align-items: center;
}

.logo {
	color: #cccccc;
	text-decoration: none;
	font-size: 15px;
	font-weight: 600;
	white-space: nowrap;
	transition: color 0.2s ease;
}

.logo:hover {
	color: #ffffff;
}

.nav-links {
	display: flex;
	list-style: none;
	margin: 0;
	padding: 0;
	gap: 0;
	height: 100%;
}

.nav-links li {
	height: 100%;
	display: flex;
	align-items: center;
}

.nav-link {
	color: #cccccc;
	text-decoration: none;
	padding: 0 16px;
	font-size: 18px;
	height: 100%;
	display: flex;
	align-items: center;
	transition: all 0.2s ease;
	border-bottom: 2px solid transparent;
	position: relative;
}

.nav-link:hover {
	background-color: #37373d;
	color: #ffffff;
}

.nav-link:active,
.nav-link.active {
	background-color: #094771;
	color: #ffffff;
	border-bottom-color: #007acc;
}

.menu-toggle {
	display: none;
	background: none;
	border: none;
	width: 30px;
	height: 30px;
	flex-direction: column;
	justify-content: center;
	align-items: center;
	gap: 3px;
	cursor: pointer;
	padding: 4px;
	border-radius: 3px;
	transition: background-color 0.2s ease;
}

.menu-toggle:hover {
	background-color: #37373d;
}

.hamburger-line {
	width: 16px;
	height: 2px;
	background-color: #cccccc;
	transition: all 0.3s ease;
	border-radius: 1px;
}

.menu-toggle.active .hamburger-line:nth-child(1) {
	transform: rotate(45deg) translate(5px, 5px);
}

.menu-toggle.active .hamburger-line:nth-child(2) {
	opacity: 0;
}

.menu-toggle.active .hamburger-line:nth-child(3) {
	transform: rotate(-45deg) translate(5px, -5px);
}

@media (max-width: 767px) {
	.menu-toggle {
		display: flex;
	}

	.nav-links {
		position: absolute;
		top: 100%;
		left: 0;
		right: 0;
		background-color: #2d2d30;
		border-bottom: 1px solid #3e3e42;
		flex-direction: column;
		height: auto;
		max-height: 0;
		overflow: hidden;
		transition: max-height 0.3s ease;
		box-shadow: 0 2px 8px rgba(0, 0, 0, 0.3);
	}

	.nav-links.mobile-open {
		max-height: 200px;
	}

	.nav-links li {
		width: 100%;
		height: auto;
	}

	.nav-link {
		width: 100%;
		height: 40px;
		padding: 0 16px;
		border-bottom: none;
		border-left: 2px solid transparent;
	}

	.nav-link:active,
	.nav-link.active {
		border-left-color: #007acc;
		border-bottom-color: transparent;
	}
}
</style>
