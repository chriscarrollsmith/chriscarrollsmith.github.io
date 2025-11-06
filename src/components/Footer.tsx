import './Footer.css';
import siteProperties from '../data/siteproperties.json';
import socialIcons from '../data/socialicons.json';
import type { SiteProperties, SocialIcons } from '../types/data';

interface FooterProps {
  foregroundColor?: string;
  backgroundColor?: string;
}

const typedSiteProperties = siteProperties as SiteProperties;
const typedSocialIcons = socialIcons as SocialIcons;

const Footer: React.FC<FooterProps> = ({ foregroundColor = 'white', backgroundColor = '#4e567e' }) => {
  if (Object.keys(typedSiteProperties).length === 0 || Object.keys(typedSocialIcons).length === 0) {
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
            {Object.entries(typedSiteProperties.socialProfiles).map(([key, value]) => {
              const iconKey = key as keyof SocialIcons;
              return typedSocialIcons[iconKey] ? (
                <a href={value} target="_blank" rel="noopener noreferrer" key={key}>
                  <img src={typedSocialIcons[iconKey]} alt={key} className="social-icon" />
                </a>
              ) : null;
            })}
          </div>
          <p className="small" style={{color: foregroundColor}}>Copyright © {typedSiteProperties.name} 2024</p>
        </div>
      </section>
    );
  }
}

export default Footer;
