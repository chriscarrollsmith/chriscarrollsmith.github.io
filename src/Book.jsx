import React, { useState, useEffect } from "react";
import { InlineWidget } from "react-calendly";

const Book = () => {
  const [height, setHeight] = useState(getIframeHeight());
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
  }, []);

  return (
    <div id="book" className="Book">
      <InlineWidget 
        url={calendlyUrl}  // use the state here
        styles={{ height }} 
      />
    </div>
  );
};

export default Book;
