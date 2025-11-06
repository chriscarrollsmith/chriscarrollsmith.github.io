import './About.css';
import aboutMe from '../data/aboutme.json';
import heroData from '../data/heroimages.json';
import ContactForm from './ContactForm';
import type { AboutMe as AboutMeType, HeroImage } from '../types/data';

const typedAboutMe = aboutMe as AboutMeType;
const typedHeroData = heroData as HeroImage[];

const About: React.FC = () => {
  const hero = typedHeroData.find(h => h.name === 'about');

  const renderHtml = (html: string) => {
    return { __html: html };
  };

  return (
    <section className={hero?.src ? hero.shade : hero?.shade === "dark" ? "black" : "white"} id="about">
      {hero && <img className="background" src={hero.src} alt={hero.alt} />}
      <div className="about-section">
        <p className="large" dangerouslySetInnerHTML={renderHtml(typedAboutMe.description)} />
        <hr />
        <div className="center-flex padded">
          {typedAboutMe.icons.map((icon) => (
            <img className="skills-icon" src={icon.src} alt={icon.alt} title={icon.alt} key={icon.alt} />
          ))}
        </div>
        <ul className="skills-list">
          {typedAboutMe.skills.map((skill) => (
            <li key={skill}>{skill}</li>
          ))}
        </ul>
        <hr />
        <p className="small" dangerouslySetInnerHTML={renderHtml(typedAboutMe.callToAction)} />
        <ContactForm />
      </div>
    </section>
  );
};

export default About;
