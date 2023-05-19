import React, { useEffect, useState } from 'react';
import './Home.css';

function Home() {
  const [property, setProperty] = useState(null);
  const [hero, setHero] = useState(null);
  const windowWidth = window.innerWidth;

  useEffect(() => {
    fetch('data/siteproperties.json')
      .then(response => response.json())
      .then(data => setProperty(data));

    // Fetch the hero images data when the component mounts
    fetch('data/heroimages.json')
      .then(response => response.json())
      .then(data => {
        // Find the hero image for the home page
        const homeHero = data.find(hero => hero.name === 'home');
        setHero(homeHero);
      })
      .catch(error => {
        console.error('Error:', error);
      });
  }, []);

  if (property === null || hero === null) {
    return <p>Loading...</p>;
  }

  return (
    <section className="dark" id="home">
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
          <div style={{ position: 'absolute', top: '30%', left: '2rem', right: '2rem'}}>
            <h1>{property.name}</h1>
            <h2>{property.title}</h2>
          </div>
          <div id="down-arrow">
            <a href="#about"><img className="clickable-icon" src="images/down-arrow.svg" alt="scroll down" /></a>
          </div>
        </>
      )}
    </section>
  );
}

export default Home;
