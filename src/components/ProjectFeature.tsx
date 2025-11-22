import './ProjectFeature.css';
import heroData from '../data/heroimages.json';
import type { HeroImage } from '../types/data';

const typedHeroData = heroData as HeroImage[];

const ProjectFeature: React.FC = () => {
  const hero = typedHeroData.find(h => h.name === 'project-feature');

  const portraitImage = { alt: "Mockup of Scribert app on a mobile device", src: "images/mobile-mockup2.png" };
  const landscapeImage = { alt: "", src: "" };
  const buttonText = "Sign up";
  const buttonUrl = "https://www.scribert.com/signin/signup";

  return (
    <section className={hero?.src ? hero?.shade : hero?.shade === "dark" ? "black" : "white"} id="project-feature">
      <div className="project-feature-section">
        <div className="callout">
          <p>
            Your AI text-to-speech companion, created by Christopher Smith: try <a href='https://scribert.com'>Scribert</a> today with promo code &lsquo;NEWALPHAUSER&rsquo; and get 100% off your first month!
          </p>
          <a href={buttonUrl} target="_blank" rel="noopener noreferrer" className="button">{buttonText}</a>
        </div>
        {landscapeImage?.src &&
        <div className="landscape-container">
          <img className="landscape-image" src={landscapeImage.src} alt="Landscape" />
        </div>
        }
        <div className="portrait-container">
          <img
            className="portrait-image"
            src={portraitImage.src}
            alt={portraitImage.alt}
            width={400}
            height={800}
            loading="lazy"
            decoding="async"
          />
        </div>
      </div>
    </section>
  );
};

export default ProjectFeature;
