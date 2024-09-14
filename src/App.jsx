import { Route, Routes } from 'react-router-dom';
import './App.css';
import Header from './components/Header';
import Home from './components/Home';
import About from './components/About';
import ProjectFeature from './components/ProjectFeature';
import Projects from './components/Projects';
import Writing from './components/Writing';
import Book from './components/Book';
import Footer from './components/Footer';
import Blog from './components/Blog';
import BlogPost from './components/BlogPost';
import Seo from './components/Seo';

function App() {
  return (
      <div className="App">
        <Header />
        <Routes>
          <Route path="/" element={
            <>
              <Seo
                title="Christopher Carroll Smith"
                description="Website of Christopher Carroll Smith, software architect, data storyteller, and president of Promptly Technologies, LLC."
                type="website"
                name="Christopher Carroll Smith"
              />
              <Home />
              <About />
              <Projects />
              <ProjectFeature />
              <Writing />
              <Book />
            </>
          } />
          <Route path="/blog" element={<Blog />} />
          <Route path="/blog/:id" element={<BlogPost />} />
        </Routes>
        <Footer />
      </div>
  );
}

export default App;