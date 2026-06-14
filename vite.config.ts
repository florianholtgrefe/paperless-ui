import tailwindcss from '@tailwindcss/vite';
import adapter from '@sveltejs/adapter-static';
import { sveltekit } from '@sveltejs/kit/vite';
import { defineConfig, loadEnv } from 'vite';

export default defineConfig(({ mode }) => {
	const env = loadEnv(mode, process.cwd(), '');
	return {
		server: {
			proxy: {
				'/api': {
					target: env.VITE_PAPERLESS_URL,
					changeOrigin: true,
				},
			},
		},
		plugins: [
			tailwindcss(),
			sveltekit({
				compilerOptions: {
					runes: ({ filename }) => filename.split(/[/\\]/).includes('node_modules') ? undefined : true
				},
				adapter: adapter({ fallback: 'index.html' })
			})
		]
	};
});
