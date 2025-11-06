import { useRef, useEffect } from 'react';

interface DangerousElementProps {
  markup: string;
  script?: string;
}

const DangerousElement: React.FC<DangerousElementProps> = ({ markup, script }) => {
  const ref = useRef<HTMLDivElement>(null);
  const scriptExecutedRef = useRef(false);

  useEffect(() => {
    if (!ref.current) return;

    const range = document.createRange();
    range.selectNode(ref.current);
    const documentFragment = range.createContextualFragment(markup);

    // Inject the markup
    ref.current.innerHTML = '';
    ref.current.append(documentFragment);

    // Execute the script only once, after the next paint
    if (script && !scriptExecutedRef.current) {
      requestAnimationFrame(() => {
        if (!ref.current) return;
        const scriptElement = document.createElement('script');
        scriptElement.text = `
          document.dispatchEvent(new Event('DOMContentLoaded'));
          ${script}
        `;
        ref.current.appendChild(scriptElement);
        scriptExecutedRef.current = true;
      });
    }
  }, [markup, script]);

  return <div ref={ref} />;
};

export default DangerousElement;