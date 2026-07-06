import starlight from '@astrojs/starlight';
import { defineConfig } from 'astro/config';

// https://astro.build/config
export default defineConfig({
	site: 'https://docs.score-watcher.com',
	integrations: [
		starlight({
			title: 'Score Watcher Help',
			social: [
				{ icon: 'x.com', label: 'X', href: 'https://x.com/newt239' },
				{ icon: 'github', label: 'GitHub', href: 'https://github.com/newt239/next-score-watcher' },
			],
			sidebar: [
				{
					label: 'ガイド',
					items: [
						{ label: '最初のゲームを作ろう', link: '/guides/example/' },
					],
				},
				{
					label: 'アプリについて',
					items: [{ autogenerate: { directory: 'reference' } }],
				},
				{
					label: '形式',
					items: [
						{ label: "形式一覧", link: "rules/" },
						{ label: "スコア計算", link: "rules/normal" },
						{ label: "N○M✕", link: "rules/nomx" },
						{ label: "NewYork", link: "rules/ny" },
						{ label: "Divide", link: "rules/divide" },
						{ label: "アタックサバイバル", link: "rules/attacksurvival" },
						{ label: "SquareX", link: "rules/squarex" },
						{ label: "Variables", link: "rules/variables" },
						{ label: "AQL", link: "rules/aql" },
						{ label: "アタック25", link: "rules/attack25" },
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
