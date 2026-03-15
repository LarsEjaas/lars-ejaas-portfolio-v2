declare module '@emails/components/primitives/Spacer.astro' {
  type Props = {
    class?: string;
    width?: number;
    height?: number;
    style?: astroHTML.JSX.HTMLAttributes['style'];
  };

  /**
   * Display a column that separates content areas vertically in your email.
   * A column needs to be used in combination with a Row component.
   *
   * @example
   *   <Row>
   *     <Column>A</Column>
   *     <Column>B</Column>
   *     <Column>C</Column>
   *   </Row>
   */
  const Spacer: (props: Props) => any;
  export default Spacer;
}
