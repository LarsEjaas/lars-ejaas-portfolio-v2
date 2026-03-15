declare module '@emails/components/primitives/Image.astro' {
  type Props = astroHTML.JSX.ImgHTMLAttributes;

  /**
   * Display an image in your email.
   *
   * @example
   * <Image src="cat.jpg" alt="Cat" width="300" height="300" />;
   */
  const Image: (props: Props) => any;
  export default Image;
}
