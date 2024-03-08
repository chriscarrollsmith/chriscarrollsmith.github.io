import Card from './Card';
import './Writing.css';
import heroData from '../data/heroimages.json';
import writingData from '../data/writing.json';

const Writing = () => {
  const hero = heroData.find(h => h.name === 'writing');

  return (
    <section className={hero ? "light" : "white"} id="writing">
      {hero && (
        <img className="background" src={hero.src} alt={hero.alt} />
      )}
      <div className="cards-wrapper">
        <div className="writing-grid">
          {writingData.map((writing, index) => (
            <Card key={index} project={writing} />
          ))}
        </div>
      </div>
      <div className="writing-grid">
        {writingData.map((writing, index) => (
          <Card key={index} project={writing} />
        ))}
      </div>
    </section>
  );
};

export default Writing;
