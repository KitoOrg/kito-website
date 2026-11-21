// @ts-check
import { defineConfig } from 'astro/config';
import starlight from '@astrojs/starlight';

// https://astro.build/config
export default defineConfig({
	// GitHub Pages, at the project's own domain (`public/CNAME`). Links
	// inside the site are relative: it is served from the root.
	site: 'https://kito.sh',
	integrations: [
		starlight({
			title: 'Kito',
			// Kito's mark, beside its name: three lanes that become one.
			logo: { light: './src/assets/kito-light.svg', dark: './src/assets/kito-dark.svg', alt: '' },
			favicon: '/favicon.svg',
			// The typeface is carried with the site: nothing is asked of anybody else.
			customCss: ['@fontsource-variable/geist', '@fontsource-variable/geist-mono', './src/styles/kito.css'],
			description: 'Version control for teams of AI agents: a lane for each, merged function by function, with the reason kept with the code.',
			// The bar with search on every page; the map at the top of the home page.
			components: { Header: './src/components/Header.astro', Hero: './src/components/Hero.astro' },
			social: [{ icon: 'github', label: 'GitHub', href: 'https://github.com/KitoOrg/kito' }],
			editLink: { baseUrl: 'https://github.com/KitoOrg/kito-website/edit/main/' },
			sidebar: [
				{ label: 'Install', slug: 'install' },
				{ label: 'Download', slug: 'download' },
				{
					label: 'Guide',
					items: [
						{ label: 'Using Kito, day to day', slug: 'guide/using-kito' },
						{ label: 'The life cycle of a change', slug: 'guide/lifecycle' },
						{ label: 'Why it is faster for teams of agents', slug: 'guide/why-faster' },
						{ label: 'Running a Kito server', slug: 'guide/server' },
						{ label: 'What your agents are told', slug: 'guide/instructions' },
					],
				},
				{
					label: 'Getting started',
					items: [
						{ label: 'First steps', slug: 'getting-started/first-steps' },
						{ label: 'A first lane', slug: 'getting-started/first-lane' },
						{ label: 'With Claude Code', slug: 'getting-started/claude-code' },
					],
				},
				{
					label: 'Concepts',
					items: [
						{ label: 'Lanes, intents and scopes', slug: 'concepts/lanes' },
						{ label: 'Merging function by function', slug: 'concepts/merging' },
						{ label: 'Git, both ways', slug: 'concepts/git' },
						{ label: 'Why code is the way it is', slug: 'concepts/why' },
						{ label: 'Lanes on lanes', slug: 'concepts/lanes-on-lanes' },
						{ label: 'Permanent lanes', slug: 'concepts/permanent-lanes' },
					],
				},
				{
					label: 'Plugins',
					items: [
						{ label: 'All plugins', slug: 'plugins' },
						{ label: 'Installing and writing plugins', slug: 'plugins/installing' },
						{ label: 'Web client', slug: 'plugins/web' },
						{ label: 'GitHub', slug: 'plugins/github' },
						{ label: 'OpenID Connect', slug: 'plugins/oidc' },
						{ label: 'Kitchen', slug: 'plugins/kitchen' },
						{ label: 'Claude Code', slug: 'plugins/claude' },
						{ label: 'Codex', slug: 'plugins/codex' },
						{ label: 'ZCode', slug: 'plugins/zcode' },
					],
				},
			],
		}),
	],
});
