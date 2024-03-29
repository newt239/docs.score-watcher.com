import { defineConfig } from 'astro/config';
import starlight from '@astrojs/starlight';

// https://astro.build/config
export default defineConfig({
	integrations: [
		starlight({
			title: 'Score Watcher Help',
			social: {
				"x.com": "https://x.com/newt239",
				github: 'https://github.com/newt239/next-score-watcher',
			},
			sidebar: [
				{
					label: 'ガイド',
					items: [
						// Each item here is one entry in the navigation menu.
						{ label: 'Example Guide', link: '/guides/example/' },
					],
				},
				{
					label: 'Reference',
					autogenerate: { directory: 'reference' },
				},
				{
					label: '形式',
					autogenerate: { directory: 'rules' },
				},
			],
		}),
	],
});
