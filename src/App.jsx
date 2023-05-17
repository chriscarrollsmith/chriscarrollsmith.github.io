import React from 'react';
import './App.css';
import Home from './Home';
import About from './About';
import Projects from './Projects';
import Book from './Book';
import Footer from './Footer';
import Header from './Header';

function App() {
  return (
    <div className="App">
      <Header />
      <Home />
      <About />
      <Projects />
      <Book />
      <Footer />
    </div>
  );
}

export default App;
