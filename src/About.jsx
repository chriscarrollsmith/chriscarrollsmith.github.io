import React, { useEffect, useState } from 'react';
import axios from 'axios';
import './About.css';

const About = () => {
  const [aboutme, setAboutme] = useState(null);
  const [hero, setHero] = useState(null);

  useEffect(() => {
    const fetchAboutme = async () => {
      const response = await axios.get('data/aboutme.json');
      setAboutme(response.data);
    };

    const fetchHero = async () => {
      const response = await axios.get('data/heroimages.json');
      const aboutHero = response.data.find((img) => img.name === 'about');
      setHero(aboutHero);
    };

    fetchAboutme();
    fetchHero();
  }, []);

  const renderHtml = (html) => {
    return { __html: html };
  };

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
