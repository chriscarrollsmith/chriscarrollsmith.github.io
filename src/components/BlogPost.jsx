import { useParams } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import blogData from '../data/blogs.json';
import DangerousElement from './DangerousElement';
import './Blog.css';
import './BlogPost.css';

const BlogPost = () => {
  const { id } = useParams();
  const post = blogData.find(p => p.id === parseInt(id));

  if (!post) {
    return <p>Post not found.</p>;
  }

  const pageTitle = `${post.title} | Christopher Carroll Smith`;
  const pageDescription = post.excerpt;
  const pageUrl = `${window.location.origin}${window.location.pathname}#/blog/${post.id}`;
  const imageUrl = post.image || 'images/Chris_landscape.jpg';

  return (
    <>
      <Helmet>
        <title>{pageTitle}</title>
        <meta name="description" content={pageDescription} />
        <meta property="og:title" content={pageTitle} />
        <meta property="og:description" content={pageDescription} />
        <meta property="og:url" content={pageUrl} />
        <meta property="og:image" content={imageUrl} />
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content={pageTitle} />
        <meta name="twitter:description" content={pageDescription} />
        <meta name="twitter:image" content={imageUrl} />
      </Helmet>
      <div className="blog-container">
        <article className="blog-post">
          <h1>{post.title}</h1>
          <time dateTime={post.date}>{new Date(post.date).toLocaleDateString()}</time>
          <DangerousElement markup={post.content} script={post.script} />
        </article>
      </div>
    </>
  );
};

export default BlogPost;