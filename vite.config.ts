import path from 'path';
import { defineConfig } from 'vite';
import { sveltekit } from '@sveltejs/kit/vite';
import tailwindcss from '@tailwindcss/vite';

export default defineConfig({
	plugins: [
		sveltekit(),
		tailwindcss() as any
	],
	resolve: {
		alias: {
			'$lib': path.resolve("./src/lib")
		}
  	}
});
