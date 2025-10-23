import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import Header from './components/layout/Header/Header';
import Home from './pages/Home/Home';
import Games from './pages/Games/Games';
import Reviews from './pages/Reviews/Reviews';
import Memories from './pages/Memories/Memories';
import Achievements from './pages/Achievements/Achievements';
import Profile from './pages/Profile/Profile';
import ProfileSetup from './pages/ProfileSetup/ProfileSetup';
import About from './pages/About/About';
import Contact from './pages/Contact/Contact';
import Faq from './pages/Faq/Faq';
import Footer from './components/layout/Footer/Footer';

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <div style={{
          display: 'flex',
          flexDirection: 'column',
          minHeight: '100vh'
        }}>

          <Header />

          <main style={{ flex: 1 }}>
            <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/games" element={<Games />} />
              <Route path="/reviews" element={<Reviews />} />
              <Route path="/memories" element={<Memories />} />
              <Route path="/achievements" element={<Achievements />} />
              <Route path="/profile/:userId" element={<Profile />} />
              <Route path="/profile/setup" element={<ProfileSetup />} />
              <Route path="/about" element={<About />} />
              <Route path="/contact" element={<Contact />} />
              <Route path="/faq" element={<Faq />} />
            </Routes>
          </main>

          <Footer />
        </div>
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;
