import './About.css';
import heroData from '../data/heroimages.json';
import ContactForm from './ContactForm';
import type { HeroImage } from '../types/data';

const typedHeroData = heroData as HeroImage[];

const About: React.FC = () => {
  const hero = typedHeroData.find(h => h.name === 'about');

  const techIcons = [
    { alt: "Typescript", src: "https://cdn.jsdelivr.net/gh/devicons/devicon@latest/icons/typescript/typescript-original.svg" },
    { alt: "Python", src: "https://cdn.jsdelivr.net/gh/devicons/devicon@latest/icons/python/python-original.svg" },
    { alt: "R", src: "https://cdn.jsdelivr.net/gh/devicons/devicon@latest/icons/r/r-original.svg" },
    { alt: "Rust", src: "https://cdn.jsdelivr.net/gh/devicons/devicon@latest/icons/rust/rust-original.svg" },
    { alt: "React", src: "https://cdn.jsdelivr.net/gh/devicons/devicon@latest/icons/react/react-original.svg" },
    { alt: "PostgreSQL", src: "https://cdn.jsdelivr.net/gh/devicons/devicon@latest/icons/postgresql/postgresql-original.svg" }
  ];

  const bioSentences = [
    <>At <a href='https://promptlytechnologies.com'>Promptly Technologies</a>, I&apos;m building the AI research stack, including agentic PDF/Excel extraction and knowledgebase management.</>,
    <>Let others chase chatbots and flashy autonomous agent demos.</>,
    <>The best AI applications operate invisibly to power immersive experiences, ablating away the tedious frictions (like indexing, formatting, and citation) that impede flow and deep work.</>,
    <>If you&apos;re exploring AI as a prosthetic to extend human capabilities and amplify human agency, we&apos;re currently partnering with forward-leaning teams to shape what comes next.</>
  ];

  return (
    <section className={`hero ${hero?.src ? hero.shade : hero?.shade === 'dark' ? 'black' : 'white'}`} id="about">
      {hero && (
        <>
          <img className="hero-bg" src={hero.src} alt={hero.alt} />
          <div className="hero-overlay" />
        </>
      )}
      <div className="hero-content">
        <div className="about-section">
          <div className="bio bio-animated">
            {bioSentences.map((sentence, i) => (
              <span key={i} className="bio-sentence">
                {sentence}
              </span>
            ))}
          </div>
          <hr />
          <div className="center-flex padded">
            {techIcons.map((icon) => (
              <img
                className="skills-icon"
                src={icon.src}
                alt={icon.alt}
                title={icon.alt}
                key={icon.alt}
                width={32}
                height={32}
                loading="lazy"
                decoding="async"
              />
            ))}
          </div>
          <hr />
          <p className="small">
            Contact me regarding partnerships, funding opportunities, contract software development, or workforce trainings and consulting services on AI workflows.
          </p>
          <ContactForm />
        </div>
      </div>
    </section>
  );
};

export default About;
