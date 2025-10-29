import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import ScrollToTop from './components/features/ScrollToTop';
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
import GameDetails from './pages/GameDetails/GameDetails';
import ReviewCreate from './pages/ReviewCreate/ReviewCreate';
import MemoryCreate from './pages/MemoryCreate/MemoryCreate';
import GameReviews from './pages/GameReviews/GameReviews';
import GameMemories from './pages/GameMemories/GameMemories';
import ReviewEdit from './pages/ReviewEdit/ReviewEdit';
import MemoryEdit from './pages/MemoryEdit/MemoryEdit';
import Collection from './pages/Collection/Collection';
import ReviewDetail from './pages/ReviewDetail/ReviewDetail';
import MemoryDetail from './pages/MemoryDetail/MemoryDetail';

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <ScrollToTop />
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
              <Route path="/games/:rawgId" element={<GameDetails />} />
              <Route path="/games/:rawgId/review/new" element={<ReviewCreate />} />
              <Route path="/games/:rawgId/memory/new" element={<MemoryCreate />} />
              <Route path="/games/:rawgId/reviews" element={<GameReviews />} />
              <Route path="/games/:rawgId/memories" element={<GameMemories />} />
              <Route path="/reviews/:id/edit" element={<ReviewEdit />} />
              <Route path="/memories/:id/edit" element={<MemoryEdit />} />
              <Route path="/collection" element={<Collection />} />
              <Route path="/profile/:userId/collection" element={<Collection />} />
              <Route path="/reviews/:id" element={<ReviewDetail />} />
              <Route path="/memories/:id" element={<MemoryDetail />} />
            </Routes>
          </main>

          <Footer />
        </div>
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;
