import React, { useState, useEffect } from "react";
import './Footer.css';

const Footer = ({ foregroundColor = 'white', backgroundColor = '#4e567e' }) => {
  const [property, setProperty] = useState(null);
  const [icons, setIcons] = useState(null);

  useEffect(() => {
    fetch('data/siteproperties.json')
      .then(response => response.json())
      .then(data => setProperty(data))
      .catch(error => console.log(error));

    fetch('data/socialicons.json')
      .then(response => response.json())
      .then(data => setIcons(data))
      .catch(error => console.log(error));
  }, []);

  if (property === null || icons === null) {
    return (
      <div id="footer" style={{backgroundColor: backgroundColor}}>
        <div>
          <p style={{color: foregroundColor}}><em>Loading...</em></p>
        </div>
      </div>
    );
  } else {
    return (
      <section>
        <div id="footer" style={{backgroundColor: backgroundColor}}>
          <div className="center-flex">
            {Object.entries(property.socialProfiles).map(([key, value]) => {
              return icons[key] ? (
                <a href={value} target="_blank" rel="noopener noreferrer" key={key}>
                  <img src={icons[key]} alt={key} className="social-icon" />
                </a>
              ) : null;
            })}
          </div>
          <p className="small" style={{color: foregroundColor}}>Created by {property.name}</p>
        </div>
      </section>
    );
  }
}

export default Footer;
