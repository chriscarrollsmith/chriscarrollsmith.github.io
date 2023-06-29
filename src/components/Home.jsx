import './Home.css';
import useFetchHero from '../hooks/useFetchHero';
import useFetchContent from '../hooks/useFetchContent';

function Home() {
  const properties = useFetchContent('data/siteproperties.json') || {};
  const hero = useFetchHero('home') || {};
  const windowWidth = window.innerWidth;

  if (Object.keys(properties).length === 0 || Object.keys(hero).length === 0) {
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
            <h1>{properties.name}</h1>
            <h2>{properties.title}</h2>
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
