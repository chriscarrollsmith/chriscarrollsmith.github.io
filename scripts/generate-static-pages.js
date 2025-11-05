import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Read blogs data
const blogsPath = path.join(__dirname, '../src/data/blogs.json');
const blogs = JSON.parse(fs.readFileSync(blogsPath, 'utf-8'));

// Read the base index.html template
const indexPath = path.join(__dirname, '../dist/index.html');
const baseHTML = fs.readFileSync(indexPath, 'utf-8');

// Site info
const siteUrl = 'https://christophercarrollsmith.com';
const authorName = 'Christopher Carroll Smith';

// Generate HTML for each blog post
blogs.forEach(post => {
  // Create the meta tags for this specific post
  const metaTags = `
    <title>${post.title.slice(0, 60)} | ${authorName}</title>
    <meta name="description" content="${post.excerpt.slice(0, 155)}..." />

    <!-- Open Graph / Facebook -->
    <meta property="og:type" content="article" />
    <meta property="og:url" content="${siteUrl}/blog/${post.id}" />
    <meta property="og:title" content="${post.title}" />
    <meta property="og:description" content="${post.excerpt.slice(0, 155)}..." />
    <meta property="og:image" content="${siteUrl}/${post.image}" />

    <!-- Twitter -->
    <meta name="twitter:card" content="summary_large_image" />
    <meta name="twitter:url" content="${siteUrl}/blog/${post.id}" />
    <meta name="twitter:title" content="${post.title}" />
    <meta name="twitter:description" content="${post.excerpt.slice(0, 155)}..." />
    <meta name="twitter:image" content="${siteUrl}/${post.image}" />
    <meta name="twitter:creator" content="@${authorName}" />
  `;

  // Replace the default meta tags in head with post-specific ones
  let postHTML = baseHTML;

  // Find the head section and inject meta tags before closing </head>
  postHTML = postHTML.replace('</head>', `${metaTags}\n  </head>`);

  // Create the blog post directory if it doesn't exist
  const blogDir = path.join(__dirname, '../dist/blog');
  if (!fs.existsSync(blogDir)) {
    fs.mkdirSync(blogDir, { recursive: true });
  }

  // Create a directory for this specific post
  const postDir = path.join(blogDir, post.id.toString());
  if (!fs.existsSync(postDir)) {
    fs.mkdirSync(postDir, { recursive: true });
  }

  // Write the HTML file
  const postPath = path.join(postDir, 'index.html');
  fs.writeFileSync(postPath, postHTML);

  console.log(`✓ Generated static page for: ${post.title}`);
});

// Also generate one for the /blog listing page
const blogListMetaTags = `
  <title>${authorName} | Blog</title>
  <meta name="description" content="Blog posts by ${authorName} on software development, Python, data science, and more." />

  <!-- Open Graph / Facebook -->
  <meta property="og:type" content="website" />
  <meta property="og:url" content="${siteUrl}/blog" />
  <meta property="og:title" content="${authorName} | Blog" />
  <meta property="og:description" content="Blog posts by ${authorName} on software development, Python, data science, and more." />

  <!-- Twitter -->
  <meta name="twitter:card" content="summary" />
  <meta name="twitter:url" content="${siteUrl}/blog" />
  <meta name="twitter:title" content="${authorName} | Blog" />
  <meta name="twitter:description" content="Blog posts by ${authorName} on software development, Python, data science, and more." />
  <meta name="twitter:creator" content="@${authorName}" />
`;

let blogListHTML = baseHTML.replace('</head>', `${blogListMetaTags}\n  </head>`);
const blogDir = path.join(__dirname, '../dist/blog');
if (!fs.existsSync(blogDir)) {
  fs.mkdirSync(blogDir, { recursive: true });
}
fs.writeFileSync(path.join(blogDir, 'index.html'), blogListHTML);
console.log(`✓ Generated static page for: Blog listing`);

console.log(`\n✅ Generated ${blogs.length + 1} static pages with SEO meta tags`);
