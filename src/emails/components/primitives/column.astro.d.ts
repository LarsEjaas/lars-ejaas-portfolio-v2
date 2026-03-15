declare module '@emails/components/primitives/Column.astro' {
  type Props = {
    class?: string;
    style?: astroHTML.JSX.HTMLAttributes['style'];
    width?: number;
    height?: number;
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
  const Column: (props: Props) => any;
  export default Column;
}
