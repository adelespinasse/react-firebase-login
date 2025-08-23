/** @type {Partial<import("typedoc").TypeDocOptions>} */

const versionLinkText = process.env.LATEST_RELEASE || "Changelog";

const config = {
  entryPoints: ['lib/index.ts'],
  alwaysCreateEntryPointModule: false,
  readme: 'DOCS.md',
  navigationLinks: {
    [versionLinkText]: 'https://www.npmjs.com/package/@aldel/react-firebase-login',
    'Email aldel': 'mailto:adelespinasse@gmail.com',
    'aldel home page': 'https://aldel.com',
  },
  projectDocuments: ['CHANGELOG.md'],
  kindSortOrder: ['Function', 'Variable', 'Class', 'Interface', 'TypeAlias'],
  searchInDocuments: true,
}

export default config;
