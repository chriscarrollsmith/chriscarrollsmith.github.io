import './About.css';
import useFetchContent from '../hooks/useFetchContent';
import useFetchHero from '../hooks/useFetchHero';

const About = () => {
  const hero = useFetchHero('about') || {};
  const aboutme = useFetchContent('data/aboutme.json') || {};

  const renderHtml = (html) => {
    return { __html: html };
  };

  if (Object.keys(hero).length === 0 || Object.keys(aboutme).length === 0) {
    return <p>Loading...</p>;
  }

  return (
    <section className="light" id="about">
      {hero && <img className="background" src={hero.src} alt={hero.alt} />}
      <div className="about-section">
        {!aboutme ? (
          <p>
            <em>Loading...</em>
          </p>
        ) : (
          <>
            <p className="large" dangerouslySetInnerHTML={renderHtml(aboutme.description)} />
            <hr />
            <ul className="skills-list">
              {aboutme.skills.map((skill) => (
                <li key={skill}>{skill}</li>
              ))}
            </ul>
            <hr />
            <p className="small" dangerouslySetInnerHTML={renderHtml(aboutme.detailOrQuote)} />
          </>
        )}
      </div>
    </section>
  );
};

export default About;
