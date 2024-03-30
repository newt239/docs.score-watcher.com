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
					label: 'アプリについて',
					autogenerate: { directory: 'reference' },
				},
				{
					label: '形式',
					items: [
						{ label: "形式一覧", link: "rules/" },
						{ label: "スコア計算", link: "rules/normal" },
						{ label: "N○M✕", link: "rules/nomx" },
						{ label: "アタックサバイバル", link: "rules/attacksurvival" },
						{ label: "Z", link: "rules/z" },
					]
				},
			],
		}),
	],
});
