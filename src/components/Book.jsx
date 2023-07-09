import React, { useState, useEffect } from "react";
import { InlineWidget } from "react-calendly";
import "./Book.css";
import useFetchContent from "../hooks/useFetchContent";
import useFetchHero from "../hooks/useFetchHero";

const Book = () => {
  const [height, setHeight] = useState(getIframeHeight());
  const hero = useFetchHero('book');
  const calendlyUrl = useFetchContent('data/siteproperties.json','calendlyURL') || {};

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

  if (Object.keys(calendlyUrl).length === 0) {
    return <p>Loading...</p>;
  }

  return (
    <section className="light" id="book-section">
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
