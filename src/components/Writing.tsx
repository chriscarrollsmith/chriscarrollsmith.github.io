import Card from './Card';
import './Writing.css';
import heroData from '../data/heroimages.json';
import SubscribeForm from './SubscribeForm';
import type { HeroImage } from '../types/data';

const typedHeroData = heroData as HeroImage[];

const Writing: React.FC = () => {
  const hero = typedHeroData.find(h => h.name === 'writing');

  const writingData = [
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
      url: "https://modelingmarkets.substack.com/"
    },
    {
      title: "Dreams from My Brain",
      description: "An experimental podcast narrating actual dreams from my actual brain",
      buttonText: "Podbean",
      url: "https://dreamsfrommybrain.podbean.com/"
    },
    {
      title: "Academic CV",
      description: "Peer-reviewed publications and other academic work",
      buttonText: "View",
      url: "/cv"
    }
  ];

  return (
    <section className={`hero ${hero?.src ? hero.shade : hero?.shade === 'dark' ? 'black' : 'white'}`} id="writing">
      {hero && (
        <>
          <img className="hero-bg" src={hero.src} alt={hero.alt} />
        </>
      )}
      <div className="hero-content">
        <div className="writing-grid">
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
