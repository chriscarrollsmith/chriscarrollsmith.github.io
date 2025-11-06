# README

## Introduction

This is a personal website and blog built with Astro and React, integrating Calendly + ConvertKit + Formspree, and configured for automatic deployment to GitHub Pages. The site uses Astro's static site generation (SSG) to create SEO-optimized pages with clean URLs, while maintaining React components for interactive features.

One exciting thing about modern web development is that there are so many great third-party services available for making even a static website interactive. A static website allows us to take advantage of free hosting, and third-party services allow us to add features like booking, contact forms, and email marketing without having to write any server-side code. This site uses Calendly to book appointments, Formspree to handle contact form submissions, and ConvertKit to capture newsletter subscriptions, all in a free-hosted website.

## Example

![Site preview](site-preview.gif "Site preview")

See the site live [here](https://christophercarrollsmith.com).

## Tech Stack

- **Astro** - Static site generator with file-based routing
- **React** - UI components (integrated via @astrojs/react)
- **Vite** - Build tool (used internally by Astro)
- **GitHub Actions** - Automated deployment
- **GitHub Pages** - Free hosting

## Key Features

- ✅ Static site generation for optimal performance
- ✅ SEO-optimized with embedded meta tags for social media previews
- ✅ Clean URLs (e.g., `/blog/1` instead of `/#/blog/1`)
- ✅ React components with selective hydration for interactivity
- ✅ Automatic deployment via GitHub Actions
- ✅ Custom domain support

## Prerequisites

You will need to have `npm` installed in your development environment. You will also need:
- A [Calendly](https://calendly.com/) account to use the `Book` component
- A [Formspree](https://formspree.io/) account to use the `ContactForm` component
- A [ConvertKit](https://convertkit.com/?lmref=R3jWSQ) account to use the `SubscribeForm` component

## Creating a repo from the template

Clone the template with the "Use this template" button. If you plan to deploy as your homepage on GitHub Pages, name your cloned repo `{YOUR-GITHUB-USERNAME}.github.io` and install dependencies in your repo folder from the command line with `npm install`.

## Development

To preview the site during development:

```bash
npm run dev
```

This starts the Astro dev server with hot module replacement (HMR).

## Customization

To edit the site, you can use GitHub Codespaces or clone the repo locally to work in the editor of your choice.

Make sure to:

- Change the `site` property in `astro.config.mjs` to `'https://{YOUR-GITHUB-USERNAME}.github.io'`

- Edit the JSON files in `src/data` and the images and documents in `public` to customize site appearance

- Edit blog posts in `src/data/blogs.json` or migrate to Markdown files if preferred

- Customize meta tags in `src/layouts/BaseLayout.astro` for default SEO settings

## Project Structure

```
/
├── public/              # Static assets (images, documents, CNAME)
├── src/
│   ├── components/      # React components (.jsx) and Astro components (.astro)
│   ├── data/           # JSON data files for content
│   ├── layouts/        # Astro layouts with SEO meta tags
│   └── pages/          # File-based routing (generates URLs)
│       ├── index.astro # Home page
│       └── blog/
│           ├── index.astro    # Blog list
│           └── [id].astro     # Dynamic blog posts
├── astro.config.mjs    # Astro configuration
└── package.json
```

## Deployment

Deployment is **automatic** via GitHub Actions. When you push to the `main` branch:

1. GitHub Actions builds the site using `astro build`
2. The static files are deployed to GitHub Pages
3. Your site is live at `https://{YOUR-GITHUB-USERNAME}.github.io`

### Manual Build

To build locally for testing:

```bash
npm run build
```

Built files appear in the `dist/` directory.

To preview the production build:

```bash
npm run preview
```

### GitHub Pages Setup

1. Go to your repository's **Settings > Pages**
2. Under **Source**, select **GitHub Actions** (not "Deploy from a branch")
3. Push to `main` branch - deployment happens automatically!

## Using a Custom Domain

If you want to use a custom domain instead of the default `https://{YOUR-GITHUB-USERNAME}.github.io` link:

### 1. Register and configure your domain

1. Register a domain name with a domain manager like GoDaddy or Domain.com. If you already have a domain you've been using for another website, restore the default DNS settings.

2. Add the domain under your **user** (or **organization**, if the repo belongs to one) "Settings > Pages" on GitHub. (Not to be confused with the **repo** "Settings > Pages"!)

3. Follow GitHub's instructions to verify your domain. This will involve going back to your domain manager and creating a DNS record. Here's how to do that on most domain managers:
   - Go to DNS management for your domain
   - Add a **TXT** record with the name and value provided by GitHub
   - Wait a couple hours for DNS changes to propagate
   - Return to GitHub "Settings > Pages" and verify

4. In your repo's **Settings > Pages**, add your custom domain

5. Configure DNS records in your domain manager:
   - Delete all existing **CNAME** records and any **A** records named "@"
   - Create four new **A** records, each named "@" with these IP addresses:
     - `185.199.108.153`
     - `185.199.109.153`
     - `185.199.110.153`
     - `185.199.111.153`
   - Create one **CNAME** record named "www" pointing to `{YOUR-GITHUB-USERNAME}.github.io`
   - Set TTL (Time to Live) to 30 minutes for all records

6. Wait a few hours for DNS propagation, then check **Settings > Pages** for "DNS check successful"

7. Enable **Enforce HTTPS** (if the option isn't available, wait a bit longer for SSL certificate issuance)

### 2. Update site configuration

1. Edit `astro.config.mjs`:
   ```js
   export default defineConfig({
     site: 'https://yourdomain.com',
     // ...
   });
   ```

2. Update `public/CNAME` with your domain name (one line):
   ```
   yourdomain.com
   ```

The GitHub Actions workflow will automatically include the CNAME file in deployments.

## Blog Posts

Blog posts are currently stored as JSON in `src/data/blogs.json`. Each post contains:
- `id` - Unique identifier (used in URL)
- `title` - Post title
- `date` - Publication date
- `excerpt` - Short description (used in meta tags for social previews)
- `content` - HTML content
- `image` - Preview image for social media
- `script` - Optional JavaScript for interactive elements

### Adding a New Blog Post

Add a new object to the `blogs.json` array:

```json
{
  "id": 4,
  "title": "Your Post Title",
  "date": "2025-01-15",
  "excerpt": "A compelling description for social media previews...",
  "content": "<p>Your HTML content here...</p>",
  "image": "images/your-preview-image.png"
}
```

The build process will automatically generate a static page at `/blog/4` with embedded SEO meta tags.

## License

This is a personal website template. Feel free to fork and customize for your own use!
