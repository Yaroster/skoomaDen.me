export const THEME_CONFIG: App.Locals['config'] = {
  /** blog title */
  title: "skoomaDen",
  /** your name */
  author: "yaroster's",
  /** website description */
  desc: "Hey there! Welcome to the Skooma Den! Kick back and relax with my blend of detailed tea reviews, chill game analysis, and fun anime discussions. Whether you're here for a cozy tea chat or just some laid-back gaming and anime vibes, I've got you covered. Join me in the Den for an easygoing read. Sit back, sip your tea, and enjoy!",
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

