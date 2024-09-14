import { Link } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import blogData from '../data/blogs.json';
import './Blog.css';

const Blog = () => {
  return (
    <>
      <Helmet>
        <title>Christopher Carroll Smith | Blog</title>
        <meta name="description" content="Website of Christopher Carroll Smith, software architect, data storyteller, and president of Promptly Technologies, LLC." />
      </Helmet>
      <div className="blog-container">
        <h1>Blog</h1>
        {blogData.map((post) => (
          <article id={post.id} key={post.id} className="blog-post-summary">
            <h2>
              <Link to={`/blog/${post.id}`}>{post.title}</Link>
            </h2>
            <time dateTime={post.date}>{new Date(post.date).toLocaleDateString()}</time>
            <p>{post.excerpt}</p>
          </article>
        ))}
      </div>
    </>
  );
};

export default Blog;