import './About.css';
import heroData from '../data/heroimages.json';
import ContactForm from './ContactForm';
import type { HeroImage } from '../types/data';

const typedHeroData = heroData as HeroImage[];

const About: React.FC = () => {
  const hero = typedHeroData.find(h => h.name === 'about');

  const techIcons = [
    { alt: "Javascript", src: "https://cdn.jsdelivr.net/gh/devicons/devicon@latest/icons/javascript/javascript-original.svg" },
    { alt: "Typescript", src: "https://cdn.jsdelivr.net/gh/devicons/devicon@latest/icons/typescript/typescript-original.svg" },
    { alt: "Python", src: "https://cdn.jsdelivr.net/gh/devicons/devicon@latest/icons/python/python-original.svg" },
    { alt: "R", src: "https://cdn.jsdelivr.net/gh/devicons/devicon@latest/icons/r/r-original.svg" },
    { alt: "React", src: "https://cdn.jsdelivr.net/gh/devicons/devicon@latest/icons/react/react-original.svg" },
    { alt: "Next.js", src: "https://cdn.jsdelivr.net/gh/devicons/devicon@latest/icons/nextjs/nextjs-original.svg" },
    { alt: "Supabase", src: "https://cdn.jsdelivr.net/gh/devicons/devicon@latest/icons/supabase/supabase-original.svg" }
  ];

  const skills = [
    "Websites",
    "AI applications",
    "Research support"
  ];

  return (
    <section className={hero?.src ? hero.shade : hero?.shade === "dark" ? "black" : "white"} id="about">
      {hero && <img className="background" src={hero.src} alt={hero.alt} />}
      <div className="about-section">
        <p className="large">
          President of <a href='https://promptlytechnologies.com'>Promptly Technologies</a> and creator of <a href='https://scribert.com'>Scribert</a>, your AI text-to-speech companion.
        </p>
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
        <ul className="skills-list">
          {skills.map((skill) => (
            <li key={skill}>{skill}</li>
          ))}
        </ul>
        <hr />
        <p className="small">
          Hire me to solve your automation problem or build your application. Reach out today to get a quote!
        </p>
        <ContactForm />
      </div>
    </section>
  );
};

export default About;
