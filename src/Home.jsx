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
          <div style={{ position: 'absolute', bottom: '4rem', left: '50%' }}>
            <a href="#about"><img src="images/down-arrow.svg" style={{ height: '3rem', width: '3rem' }} alt="scroll down" /></a>
          </div>
        </>
      )}
    </section>
  );
}

export default Home;
