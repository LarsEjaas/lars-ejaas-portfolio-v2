declare module '@emails/components/primitives/Section.astro' {
  type Props = {
    class?: string;
    style?: astroHTML.JSX.HTMLAttributes['style'];
    width?: string;
  };

  /**
   * Display a section that can also be formatted using rows and columns.
   *
   * @example
   *  // A simple `section`
   *  <Section>
   *    <Text>Hello World</Text>
   *  </Section>
   *
   *   // Formatted with `rows` and `columns`
   *    <Section>
   *     <Row>
   *       <Column>Column 1, Row 1</Column>
   *       <Column>Column 2, Row 1</Column>
   *     </Row>
   *    <Row>
   *       <Column>Column 1, Row 2</Column>
   *       <Column>Column 2, Row 2</Column>
   *     </Row>
   *   </Section>
   */
  const Section: (props: Props) => any;
  export default Section;
}
