import React, { useState, useEffect } from "react";
import { InlineWidget } from "react-calendly";
import "./Book.css";

const Book = () => {
  const [height, setHeight] = useState(getIframeHeight());
  const [hero, setHero] = useState(null);
  const [calendlyUrl, setCalendlyUrl] = useState("");

  function getIframeHeight() {
    const windowWidth = window.innerWidth;
    if (windowWidth >= 999) {
      return '680px';
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

  useEffect(() => {
    // Fetch data from the JSON file
    fetch('data/siteproperties.json')
      .then(response => response.json())
      .then(data => setCalendlyUrl(data.calendly))
      .catch(error => console.error(error));

    // Fetch the hero images data when the component mounts
    fetch('data/heroimages.json')
      .then(response => response.json())
      .then(data => {
        // Find the hero image for the home page
        const bookHero = data.find(hero => hero.name === 'book');
        setHero(bookHero);
      })
      .catch(error => {
        console.error('Error:', error);
      });
  }, []);

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
