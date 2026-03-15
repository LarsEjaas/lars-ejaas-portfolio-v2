declare module '@emails/components/primitives/Link.astro' {
  type Props = astroHTML.JSX.AnchorHTMLAttributes;

  /**
   * A hyperlink to web pages, email addresses, or anything else a URL can address.
   *
   * @example
   *  <Link href="https://example.com">Example</Link>;
   */
  const Link: (props: Props) => any;
  export default Link;
}
