import Card from './Card';
import './Writing.css';
import heroData from '../data/heroimages.json';
import writingData from '../data/writing.json';
import SubscribeForm from './SubscribeForm';
import type { HeroImage, Writing as WritingType } from '../types/data';

const typedHeroData = heroData as HeroImage[];
const typedWritingData = writingData as WritingType[];

const Writing: React.FC = () => {
  const hero = typedHeroData.find(h => h.name === 'writing');

  return (
    <section className={hero?.src ? hero.shade : hero?.shade === "dark" ? "black" : "white"} id="writing">
      {hero && (
        <img className="background" src={hero.src} alt={hero.alt} />
      )}
      <div className="writing-grid">
        {typedWritingData.map((writing, index) => (
          <Card key={index} project={writing} />
        ))}
        <SubscribeForm />
      </div>
    </section>
  );
};

export default Writing;
