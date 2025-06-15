import { Routes, Route } from 'react-router-dom';
import NavBar from './components/NavBar';
import HomePage from './pages/HomePage';
import LoginPage from './pages/LoginPage';
import TriviaPage from './pages/TriviaPage';
import SubmitEventPage from './pages/SubmitEventPage';

function App() {
  return (
    <>
      <NavBar />
      <main>
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/trivia" element={<TriviaPage />} />
          <Route path="/submit" element={<SubmitEventPage />} />
        </Routes>
      </main>
    </>
  );
}

export default App;
