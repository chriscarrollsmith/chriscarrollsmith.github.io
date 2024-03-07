import './Footer.css';
import siteProperties from '../data/siteproperties.json';
import socialIcons from '../data/socialicons.json';

const Footer = ({ foregroundColor = 'white', backgroundColor = '#4e567e' }) => {
  if (Object.keys(siteProperties).length === 0 || Object.keys(socialIcons).length === 0) {
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
            {Object.entries(siteProperties.socialProfiles).map(([key, value]) => {
              return socialIcons[key] ? (
                <a href={value} target="_blank" rel="noopener noreferrer" key={key}>
                  <img src={socialIcons[key]} alt={key} className="social-icon" />
                </a>
              ) : null;
            })}
          </div>
          <p className="small" style={{color: foregroundColor}}>Copyright © {siteProperties.name} 2024</p>
        </div>
      </section>
    );
  }
}

export default Footer;
