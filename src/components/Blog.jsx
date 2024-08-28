import { useRef, useEffect } from 'react';
import PropTypes from 'prop-types';
import blogData from '../data/blogs.json';
import './Blog.css';

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

const Blog = () => {
  return (
    <div className="blog-container">
      <h1>Blog</h1>
      {blogData.map((post) => (
        <article key={post.id} className="blog-post">
          <h2>{post.title}</h2>
          <time dateTime={post.date}>{new Date(post.date).toLocaleDateString()}</time>
          <DangerousElement markup={post.content} script={post.script} />
        </article>
      ))}
    </div>
  );
};

DangerousElement.propTypes = {
  markup: PropTypes.string.isRequired,
  script: PropTypes.string,
};

export default Blog;