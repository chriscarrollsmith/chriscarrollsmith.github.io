import { Helmet } from 'react-helmet-async';

interface SeoProps {
  title: string;
  description: string;
  type: string;
  name: string;
  image?: string;
}

const Seo: React.FC<SeoProps> = ({ title, description, type, name, image }) => {
  return (
    <Helmet>
      <title>{title}</title>
      <meta name="description" content={description} />
      <meta property="og:type" content={type} />
      <meta property="og:title" content={title} />
      <meta property="og:description" content={description} />
      <meta name="twitter:creator" content={name} />
      <meta name="twitter:card" content={type} />
      <meta name="twitter:title" content={title} />
      <meta name="twitter:description" content={description} />
      {image ? <meta property="og:image" content={image} /> : null}
    </Helmet>
  );
};

export default Seo;
