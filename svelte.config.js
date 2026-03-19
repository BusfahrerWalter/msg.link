import adapter from '@sveltejs/adapter-node';

/** @type {import('@sveltejs/kit').Config} */
const config = {
	kit: {
		adapter: adapter(),
		alias: {
			"@/*": "./src/lib/*",
			'$src/*': './src/*'
		}
	},
	vitePlugin: {
		dynamicCompileOptions: ({ filename }) => {
			return filename.includes('node_modules') ? void 0 : { runes: true };
		}
	}
};

export default config;
