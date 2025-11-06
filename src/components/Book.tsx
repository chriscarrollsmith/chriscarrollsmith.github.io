import { useState, useEffect } from "react";
import { InlineWidget } from "react-calendly";
import "./Book.css";
import siteProperties from "../data/siteproperties.json";
import heroData from '../data/heroimages.json';
import type { HeroImage, SiteProperties } from '../types/data';

const typedSiteProperties = siteProperties as SiteProperties;
const typedHeroData = heroData as HeroImage[];

const Book: React.FC = () => {
  const [height, setHeight] = useState(getIframeHeight());
  const hero = typedHeroData.find(h => h.name === 'book');
  const calendlyUrl = typedSiteProperties.calendlyUrl;

  function getIframeHeight(): string {
    const windowWidth = window.innerWidth;
    if (windowWidth >= 999) {
      return '690px';
    } else {
      return '900px';
    }
  }

  useEffect(() => {
    const handleResize = () => {
      setHeight(getIframeHeight());
    };

    window.addEventListener('resize', handleResize);

    // Cleanup function
    return () => {
      window.removeEventListener('resize', handleResize);
    }
  }, []);

  return (
    <section className={hero?.src ? hero.shade : hero?.shade === "dark" ? "black" : "white"} id="book-section">
      {hero && (
        <>
          <img
            className="background"
            src={hero.src}
            alt={hero.alt}
          />
          <div id="book" className="Book">
            <InlineWidget 
              url={calendlyUrl}
              styles={{ height }} 
            />
          </div>
        </>
      )}
    </section>
  );
};

export default Book;
