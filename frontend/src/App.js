import { Routes, Route } from 'react-router-dom';
import NavBar from './components/NavBar';
import HomePage from './pages/HomePage';
import LoginPage from './pages/LoginPage';
import TriviaPage from './pages/TriviaPage';
import SubmitEventPage from './pages/SubmitEventPage';
import CategoriesPage from './pages/CategoriesPage';
import EventDetailPage from './pages/EventDetailPage';
import { useContext } from 'react';
import { UserContext } from './context/UserContext';

function App() {
  const { loading } = useContext(UserContext);

  if (loading) {
    return <div style={{textAlign: 'center', marginTop: '5rem', fontSize: '1.5rem'}}>Loading Application...</div>;
  }

  return (
    <>
      <NavBar />
      <main>
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/categories" element={<CategoriesPage />} />
          <Route path="/events/:id" element={<EventDetailPage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/trivia" element={<TriviaPage />} />
          <Route path="/submit" element={<SubmitEventPage />} />
        </Routes>
      </main>
    </>
  );
}

export default App;
