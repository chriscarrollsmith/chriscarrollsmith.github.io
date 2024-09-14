import { useRef, useEffect } from 'react';
import PropTypes from 'prop-types';

const DangerousElement = ({ markup, script }) => {
  const ref = useRef();
  const scriptExecutedRef = useRef(false);

  useEffect(() => {
    const range = document.createRange();
    range.selectNode(ref.current);
    const documentFragment = range.createContextualFragment(markup);

    // Inject the markup
    ref.current.innerHTML = '';
    ref.current.append(documentFragment);

    // Execute the script only once, after the next paint
    if (script && !scriptExecutedRef.current) {
      requestAnimationFrame(() => {
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

DangerousElement.propTypes = {
  markup: PropTypes.string.isRequired,
  script: PropTypes.string,
};

export default DangerousElement;