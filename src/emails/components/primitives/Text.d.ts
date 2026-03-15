type Props = astroHTML.JSX.HTMLAttributes;

declare module '@emails/components/primitives/Text.astro' {
  type Props = {
    class?: string;
    style?: astroHTML.JSX.HTMLAttributes['style'];
    width?: string;
  };

  /**
   * A block of text separated by blank spaces.
   *
   * @example
   *  <Text>Lorem ipsum</Text>
   */
  const Text: (props: Props) => any;
  export default Text;
}
