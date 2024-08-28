import { NavLink, useLocation, useNavigate } from 'react-router-dom';
import { useEffect } from 'react';
import './Header.css';

const Header = () => {
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    if (location.hash) {
      const id = location.hash.substring(1); // remove the '#' character
      setTimeout(() => {
        const element = document.getElementById(id);
        if (element) {
          element.scrollIntoView({ behavior: 'smooth' });
        }
      }, 0);
    }
  }, [location]);

  const handleAnchorClick = (e, hash) => {
    e.preventDefault();
    if (location.pathname !== '/') {
      navigate(`/${hash}`);
    } else {
      navigate(hash);
    }
  };

  return (
    <div id="header">
      <a href="/#home" onClick={(e) => handleAnchorClick(e, '#home')}>Home</a>
      <a href="/#about" onClick={(e) => handleAnchorClick(e, '#about')}>About</a>
      <a href="/#projects" onClick={(e) => handleAnchorClick(e, '#projects')}>Projects</a>
      <a href="/#writing" onClick={(e) => handleAnchorClick(e, '#writing')}>Writing</a>
      <a href="/#book" onClick={(e) => handleAnchorClick(e, '#book')}>Book a Meeting</a>
      <NavLink to="/blog">Blog</NavLink>
    </div>
  );
};

export default Header;