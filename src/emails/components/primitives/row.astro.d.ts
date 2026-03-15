declare module '@emails/components/primitives/Row.astro' {
  type Props = {
    class?: string;
    style?: astroHTML.JSX.HTMLAttributes['style'];
    /** width of the row - defaults to: `100%` */
    width?: number | '100%';
  };

  /**
   * Display a row that separates content areas horizontally in your email.
   *
   * @example
   *  <Section>
   *   <Row>
   *    <Column>A</Column>
   *   </Row>
   *   <Row>
   *     <Column>B</Column>
   *   </Row>
   *   <Row>
   *     <Column>C</Column>
   *   </Row>
   * </Section>
   */
  const Row: (props: Props) => any;
  export default Row;
}
