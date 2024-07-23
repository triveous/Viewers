

declare global {
  namespace JSX {
    interface IntrinsicElements {
      'lhc-form': React.DetailedHTMLProps<React.HTMLAttributes<HTMLElement> & { formDefinition?: string }, HTMLElement>;
    }
  }
}
