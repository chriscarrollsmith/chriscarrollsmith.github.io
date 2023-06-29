import './Footer.css';
import useFetchContent from '../hooks/useFetchContent';

const Footer = ({ foregroundColor = 'white', backgroundColor = '#4e567e' }) => {
  const properties = useFetchContent('data/siteproperties.json') || {};
  const icons = useFetchContent('data/socialicons.json') || {};

  if (Object.keys(properties).length === 0 || Object.keys(icons).length === 0) {
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
            {Object.entries(properties.socialProfiles).map(([key, value]) => {
              return icons[key] ? (
                <a href={value} target="_blank" rel="noopener noreferrer" key={key}>
                  <img src={icons[key]} alt={key} className="social-icon" />
                </a>
              ) : null;
            })}
          </div>
          <p className="small" style={{color: foregroundColor}}>Created by {properties.name}</p>
        </div>
      </section>
    );
  }
}

export default Footer;
