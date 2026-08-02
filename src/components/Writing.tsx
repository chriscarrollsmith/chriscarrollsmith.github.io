import Card from './Card';
import './Writing.css';
import heroData from '../data/heroimages.json';
import SubscribeForm from './SubscribeForm';
import { heroSectionClass } from '../utils/heroSection';
import type { HeroImage } from '../types/data';

const typedHeroData = heroData as HeroImage[];

const Writing: React.FC = () => {
  const hero = typedHeroData.find(h => h.name === 'writing');

  const writingData = [
    {
      title: "Blog",
      description: "Original essays and technical writing on AI, software, and data",
      buttonText: "Read",
      url: "/blog"
    },
    {
      title: "A Knowledge Workers' Guide to the Singularity",
      description: "A Substack newsletter on staying employed in knowledge work amid major technological disruption by AI",
      buttonText: "Substack",
      url: "https://knowledgeworkersguide.substack.com/"
    },
    {
      title: "Modeling Markets",
      description: "A Substack newsletter on economic modeling and quantitative finance",
      buttonText: "Substack",
      url: "https://modelingmarkets.substack.com/",
      img: "wspzoo-thumbnail.webp"
    },
    {
      title: "Dreams from My Brain",
      description: "An experimental podcast narrating actual dreams from my actual brain",
      buttonText: "Podbean",
      url: "https://dreamsfrommybrain.podbean.com/",
      img: "dfmb-thumbnail.webp"
    },
    {
      title: "Academic CV",
      description: "Peer-reviewed publications and other academic work",
      buttonText: "View",
      url: "/cv"
    }
  ];

  return (
    <section className={heroSectionClass(hero)} id="writing">
      {hero?.src && (
        <>
          <img className="hero-bg" src={hero.src} alt={hero.alt} />
          <div className="hero-overlay" />
        </>
      )}
      <div className="hero-content">
        <div className="writing-grid">
          <div className="category-title-container">
            <h2 className="category-title">Writing</h2>
          </div>
          {writingData.map((writing, index) => (
            <Card key={index} project={writing} />
          ))}
          <SubscribeForm />
        </div>
      </div>
    </section>
  );
};

export default Writing;
