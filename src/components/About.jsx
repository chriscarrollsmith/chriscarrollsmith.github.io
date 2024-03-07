import './About.css';
import aboutMe from '../data/aboutme.json';
import heroData from '../data/heroimages.json';

const About = () => {
  const hero = heroData.find(h => h.name === 'about');

  const renderHtml = (html) => {
    return { __html: html };
  };

  return (
    <section className={hero ? "light" : "white"} id="about">
      {hero && <img className="background" src={hero.src} alt={hero.alt} />}
      <div className="about-section">
        <p className="large" dangerouslySetInnerHTML={renderHtml(aboutMe.description)} />
        <hr />
        <div className="center-flex padded">
          {aboutMe.icons.map((icon) => (
            <img className="skills-icon" src={icon.src} alt={icon.alt} title={icon.alt} key={icon.alt} />
          ))}
        </div>
        <ul className="skills-list">
          {aboutMe.skills.map((skill) => (
            <li key={skill}>{skill}</li>
          ))}
        </ul>
        <hr />
        <p className="small" dangerouslySetInnerHTML={renderHtml(aboutMe.callToAction)} />
      </div>
    </section>
  );
};

export default About;
