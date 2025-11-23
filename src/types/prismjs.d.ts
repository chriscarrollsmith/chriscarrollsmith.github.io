declare module 'prismjs' {
  const Prism: {
    highlightAll: () => void;
    [key: string]: unknown;
  };

  export default Prism;
}

declare module 'prismjs/components/prism-python';


