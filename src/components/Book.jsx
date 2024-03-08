import React, { useState, useEffect } from "react";
import { InlineWidget } from "react-calendly";
import "./Book.css";
import siteProperties from "../data/siteproperties.json";
import heroData from '../data/heroimages.json';

const Book = () => {
  const [height, setHeight] = useState(getIframeHeight());
  const hero = heroData.find(h => h.name === 'book');
  const calendlyUrl = siteProperties.calendlyUrl;

  function getIframeHeight() {
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
    <section className={hero.src ? hero.shade : hero.shade === "dark" ? "black" : "white"} id="book-section">
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
