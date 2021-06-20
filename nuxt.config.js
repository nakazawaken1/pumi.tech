const TITLE = 'ぷみてく';
const DESCRIPTION = 'ぷログラミング みニてくニック';
const BASE_URL = 'https://pumi.tech';
const AUTHOR = 'nakazawaken1';
const EMAIL = 'nakazawaken1@gmail.com';
export default {
  // Target: https://go.nuxtjs.dev/config-target
  target: 'static',

  // Global page headers: https://go.nuxtjs.dev/config-head
  head: {
    title: TITLE,
    meta: [
      { charset: 'utf-8' },
      { hid: 'viewport', name: 'viewport', content: 'width=320' },
      { hid: 'description', name: 'description', content: DESCRIPTION },
      { hid: 'author', name: 'author', content: AUTHOR },
      { hid: 'og:site_name', property: 'og:site_name', content: TITLE },
      { hid: 'og:type', property: 'og:type', content: 'website' },
      { hid: 'og:url', property: 'og:url', content: process.env.BASE_URL || BASE_URL },
      { hid: 'og:title', property: 'og:title', content: TITLE },
      { hid: 'og:description', property: 'og:description', content: DESCRIPTION },
      { hid: 'og:image', property: 'og:image', content: `${process.env.BASE_URL || BASE_URL}/ogp.png` },
    ],
    link: [
      { rel: 'icon', type: 'image/x-icon', href: '/favicon.ico' },
      { rel: 'stylesheet', href: 'https://fonts.googleapis.com/css?family=M+PLUS+Rounded+1c&display=swap', media: 'print', onload: "this.onload=null; this.media='all'" },
      { rel: 'stylesheet', href: '/reset.css' }
    ]
  },

  // Global CSS: https://go.nuxtjs.dev/config-css
  css: [
  ],

  // Plugins to run before rendering page: https://go.nuxtjs.dev/config-plugins
  plugins: [
    "~/plugins/common.js"
  ],

  // Auto import components: https://go.nuxtjs.dev/config-components
  components: true,

  // Modules for dev and build (recommended): https://go.nuxtjs.dev/config-modules
  buildModules: [
    // https://go.nuxtjs.dev/typescript
    '@nuxt/typescript-build',
    ['@nuxtjs/fontawesome', {
      icons: {
        solid: ['faSearch', 'faBell', 'faUserCircle', 'faBars', 'faTimes'],
        regular: [],
        brands: []
      }
    }]
  ],

  // Modules: https://go.nuxtjs.dev/config-modules
  modules: [
    // https://go.nuxtjs.dev/axios
    ['@nuxtjs/axios', {
      // Axios module configuration: https://go.nuxtjs.dev/config-axios
      baseURL: process.env.BASE_URL
    }],
    // https://go.nuxtjs.dev/pwa
    ['@nuxtjs/pwa', {
      // PWA module configuration: https://go.nuxtjs.dev/pwa
      manifest: {
        lang: 'ja'
      }
    }],
    // https://content.nuxtjs.org
    '@nuxt/content',
    // https://sitemap.nuxtjs.org
    ['@nuxtjs/sitemap', {
      hostname: process.env.BASE_URL || BASE_URL,
      defaults: {
        lastmod: new Date()
      },
      async routes() {
        const { $content } = require('@nuxt/content')
        const contents = await $content().only(['path', 'updatedAt']).fetch()
        return contents.map(i => ({ url: i.path, lastmod: i.updatedAt }))
      }
    }],
    '@nuxtjs/feed',
  ],

  feed() {
    const { $content } = require('@nuxt/content')
    const types = [
      { type: 'rss2', file: '/rss.xml' },
      { type: 'atom1', file: '/atom.xml' },
      { type: 'json1', file: '/feed.json' }];
    return types.map(({ file, type }) => ({
      path: file,
      type: type,
      // cacheTime: 1000 * 60 * 60,
      async create(feed) {
        feed.options = {
          title: TITLE,
          link: process.env.BASE_URL || BASE_URL,
          description: DESCRIPTION
        }
        feed.addContributor({
          name: AUTHOR,
          email: EMAIL,
          link: process.env.BASE_URL || BASE_URL
        })

        const contents = await $content({ deep: true }).fetch()
        contents.forEach(i => {
          const url = `${process.env.BASE_URL || BASE_URL}${i.path}`;
          feed.addItem({
            title: i.title,
            id: url,
            link: url,
            date: new Date(i.updatedAt),
            description: i.description,
            author: i.authors,
          })
        })
      }
    }))
  },

  // Build Configuration: https://go.nuxtjs.dev/config-build
  build: {
  },
}
