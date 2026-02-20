declare module 'markdown-it-texmath' {
  import type MarkdownIt from 'markdown-it'

  interface TexMathOptions {
    engine: unknown
    delimiters?: string
    macros?: Record<string, string>
  }

  function texmath(md: MarkdownIt, options: TexMathOptions): void
  export default texmath
}
