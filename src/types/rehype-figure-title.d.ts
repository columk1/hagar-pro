declare module 'rehype-figure-title' {
  import { Plugin } from 'unified'

  interface RehypeFigureTitleOptions {
    // Add any options if they exist
  }

  const rehypeFigureTitle: Plugin<[RehypeFigureTitleOptions?], any, any>

  export = rehypeFigureTitle
}
