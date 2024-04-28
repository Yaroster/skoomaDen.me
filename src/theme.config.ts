export const THEME_CONFIG: App.Locals['config'] = {
  /** blog title */
  title: "skoomaDen",
  /** your name */
  author: "yaroster's",
  /** website description */
  desc: "Welcome to the Skooma Den !",
  /** your deployed domain */
  website: "https://skoomaDen.me",
  /** your locale */
  locale: "en-us",
  /** theme style */
  themeStyle: "light",
  /** your socials */
  socials: [
    {
      name: "github",
      href: "https://github.com/Yaroster",
    },
    {
      name: "rss",
      href: "/atom.xml",
    },
    {
      name: "twitter",
      href: "https://twitter.com/Yaroster",
    },
    {
      name: "steepster",
      href: "https://steepster.com/Yaroster",
    }
  ],
  /** your header info */
  header: {
    twitter: "@yaroster",
  },
  /** your navigation links */
  navs: [
    {
      name: "Posts",
      href: "/posts/page/1",
    },
    {
      name: "Archive",
      href: "/archive",
    },
    {
      name: "Categories",
      href: "/categories"
    },
    {
      name: "About",
      href: "/about",
    },
  ],
  /** your category name mapping, which the `path` will be shown in the url */
  category_map: [
    { name: "胡适", path: "hu-shi" },
  ],
  /** your comment provider */
  comments: {
    disqus: {
      shortname: "skoomaDen",
    },
    // giscus: {
    //   repo: 'moeyua/astro-theme-skoomaDen',
    //   repoId: 'R_kgDOKy9HOQ',
    //   category: 'General',
    //   categoryId: 'DIC_kwDOKy9HOc4CegmW',
    //   mapping: 'title',
    //   strict: '0',
    //   reactionsEnabled: '1',
    //   emitMetadata: '1',
    //   inputPosition: 'top',
    //   theme: 'light',
    //   lang: 'en-us',
    //   loading: 'lazy',
    // },
    // twikoo: {
    //   envId: "https://twikoo-tau-flame.vercel.app",
    // }
  }
}

