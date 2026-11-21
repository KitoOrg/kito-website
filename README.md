# kito-website

The website of [Kito](https://github.com/KitoOrg/kito): what it is, how to
install it, where to download it, and its documentation. Built with Astro and
Starlight, and served at https://kito.sh.

## Work on it

Node 20 or later.

```bash
npm install
npm run dev        # http://localhost:4321
npm run build      # the static site, in dist/
npm run preview    # serves dist/
```

Pages are Markdown in `src/content/docs/`; the sidebar is in
`astro.config.mjs`.
