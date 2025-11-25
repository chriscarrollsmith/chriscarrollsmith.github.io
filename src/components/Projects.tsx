import './Projects.css';
import heroData from '../data/heroimages.json';
import Card from './Card';
import type { HeroImage } from '../types/data';

const typedHeroData = heroData as HeroImage[];

const Projects: React.FC = () => {
  const hero = typedHeroData.find(h => h.name === 'projects');

  const projectsData = [
    {
      category: "Web applications",
      projects: [
        {
          title: "Furn-E",
          url: "https://github.com/TeamZombies/furne_frontend",
          description: "Interior design AI image generator with product image search",
          img: "furne-desktop.jpg",
          "icon-overlay": "AECTech-ribbon-optimized.svg"
        },
        {
          title: "SessionScribe",
          url: "https://github.com/chriscarrollsmith/session-scribe",
          description: "AI transcribe-to-print pipeline",
          img: "sessionscribe-desktop.png",
          "icon-overlay": "Epson-ribbon-optimized.svg"
        },
        {
          title: "Promptly Technologies, LLC website",
          url: "https://promptlytechnologies.com",
          description: "Comic book-style Typescript React website with Zazzle product syndication",
          img: "promptly-desktop.png"
        }
      ]
    },
    {
      category: "Utilities",
      projects: [
        {
          title: "epson-connect-js",
          url: "https://github.com/chriscarrollsmith/epson-connect-js",
          description: "Javascript client library for working with the Epson Connect API"
        },
        {
          title: "imfp / imfr",
          url: "https://github.com/chriscarrollsmith/imfp",
          description: "Python and R client libraries for working with the International Monetary Fund Data API"
        },
        {
          title: "dir-diary",
          url: "https://github.com/Promptly-Technologies-LLC/dir-diary",
          description: "AI-powered project folder summarization and documentation tool"
        }
      ]
    }
  ];

  return (
    <section className={`hero ${hero?.src ? hero.shade : hero?.shade === 'dark' ? 'black' : 'white'}`} id="projects">
      {hero && (
        <>
          <img className="hero-bg" src={hero.src} alt={hero.alt} />
        </>
      )}
      <div className="hero-content">
        {projectsData.map((category, categoryIndex) => (
          <div className="category-container" key={categoryIndex}>
            <div className="projects-grid">
              <div className="category-title-container">
                <h2 className="category-title">{category.category}</h2>
              </div>
              {category.projects.map((project, projectIndex) => (
                <Card
                  key={projectIndex}
                  project={project}
                />
              ))}
            </div>
          </div>
        ))}
      </div>
    </section>
  );
};

export default Projects;