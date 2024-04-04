import starlight from '@astrojs/starlight';
import { defineConfig } from 'astro/config';

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
						{ label: '最初のゲームを作ろう', link: '/guides/example/' },
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
				{
					label: '高度な機能',
					items: [
						{ label: 'プロファイルの切り替え', link: '/advanced/change-profile/' },
					],
				}
			],
		}),
	],
});
