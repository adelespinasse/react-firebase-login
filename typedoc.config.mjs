/** @type {Partial<import("typedoc").TypeDocOptions>} */
const config = {
  entryPoints: ['lib/index.ts'],
  readme: 'DOCS.md',
  navigationLinks: {
    'Email author': 'mailto:adelespinasse@gmail.com',
    'Author\'s home page': 'https://aldel.com',
  },
}

export default config;
