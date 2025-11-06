import { useParams } from 'react-router-dom';
import Seo from './Seo';
import blogData from '../data/blogs.json';
import DangerousElement from './DangerousElement';
import './Blog.css';
import './BlogPost.css';
import type { BlogPost as BlogPostType } from '../types/data';

const typedBlogData = blogData as BlogPostType[];

const BlogPost: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const post = typedBlogData.find(p => p.id === parseInt(id || '0'));

  if (!post) {
    return <p>Post not found.</p>;
  }

  const pageTitle = `${post.title.slice(0, 60)}` + ' | Christopher Carroll Smith';
  const pageDescription = post.excerpt.slice(0, 155) + '...';

  return (
    <>
      <Seo 
        title={pageTitle}
        description={pageDescription}
        type="article"
        name="Christopher Carroll Smith"
      />
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