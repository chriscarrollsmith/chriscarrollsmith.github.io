import './Home.css';
import siteProperties from '../data/siteproperties.json';
import heroData from '../data/heroimages.json';
import type { SiteProperties, HeroImage } from '../types/data';

const typedSiteProperties = siteProperties as SiteProperties;
const typedHeroData = heroData as HeroImage[];

const Home: React.FC = () => {
  const hero = typedHeroData.find(h => h.name === 'home');
  const windowWidth = window.innerWidth;

  if (Object.keys(typedSiteProperties).length === 0 || !hero || Object.keys(hero).length === 0) {
    return <p>Loading...</p>;
  }

  return (
    <section id="home" className="home-section">
      {hero && (
        <>
          <img
            className="background"
            src={hero.src}
            alt={hero.alt}
            style={{
              objectPosition: windowWidth < 1282 ? `calc(50% - ${hero.adjustment}) center` : `center`
            }}
          />
          <div className="home-overlay"></div>
          <div className="home-content">
            <h1>{typedSiteProperties.name}</h1>
            <h2>{typedSiteProperties.title}</h2>
          </div>
          <div id="down-arrow">
            <a href="#about"><img className="clickable-icon" src="/images/down-arrow.svg" alt="scroll down" /></a>
          </div>
        </>
      )}
    </section>
  );
}

export default Home;
