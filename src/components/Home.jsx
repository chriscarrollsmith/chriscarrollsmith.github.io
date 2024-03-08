import './Home.css';
import siteProperties from '../data/siteproperties.json';
import heroData from '../data/heroimages.json';

function Home() {
  const hero = heroData.find(h => h.name === 'home');
  const windowWidth = window.innerWidth;

  if (Object.keys(siteProperties).length === 0 || Object.keys(hero).length === 0) {
    return <p>Loading...</p>;
  }

  return (
    <section className={hero.src ? hero.shade : hero.shade === "dark" ? "black" : "white"} id="home">
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
            <h1>{siteProperties.name}</h1>
            <h2>{siteProperties.title}</h2>
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
