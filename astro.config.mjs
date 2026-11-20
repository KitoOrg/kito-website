// @ts-check
import { defineConfig } from 'astro/config';
import starlight from '@astrojs/starlight';

// https://astro.build/config
export default defineConfig({
	// GitHub Pages of the organisation; links inside the site are relative,
	// so a domain of its own later only changes these two lines.
	site: 'https://kitoorg.github.io',
	base: '/kito-website',
	integrations: [
		starlight({
			title: 'Kito',
			description: 'Semantic version control for swarms of AI agents.',
			social: [{ icon: 'github', label: 'GitHub', href: 'https://github.com/KitoOrg/kito' }],
			editLink: { baseUrl: 'https://github.com/KitoOrg/kito-website/edit/main/' },
			sidebar: [
				{ label: 'Install', slug: 'install' },
				{ label: 'Download', slug: 'download' },
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
				{ label: 'Design', slug: 'design' },
			],
		}),
	],
});
