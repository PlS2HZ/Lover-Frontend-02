import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { ThemeProvider } from './ThemeContext'; // ✨ 1. นำเข้า ThemeProvider
import Navbar from './components/Navbar';
import HomePage from './pages/HomePage';
import CreateRequest from './pages/CreateRequest';
import HistoryPage from './pages/HistoryPage';
import Login from './pages/Login';
import Register from './pages/Register';
import CalendarPage from './pages/CalendarPage';
import ProfilePage from './pages/ProfilePage';
import MoodPage from './pages/MoodPage';
import WishlistPage from './pages/WishlistPage';
import MomentPage from './pages/MomentPage';

const ProtectedRoute = ({ children }) => {
  const token = localStorage.getItem('token');
  if (!token) {
    return <Navigate to="/login" replace />;
  }
  return children;
};

function App() {
  return (
    /* ✨ 2. นำ ThemeProvider มาครอบ Router ไว้ เพื่อให้ Navbar และหน้าอื่นๆ ใช้ useTheme ได้ */
    <ThemeProvider>
      <Router>
        <Navbar />
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />

          <Route 
            path="/create" 
            element={
              <ProtectedRoute>
                <CreateRequest />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/history" 
            element={
              <ProtectedRoute>
                <HistoryPage />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/calendar" 
            element={
              <ProtectedRoute>
                <CalendarPage />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/profile" 
            element={
              <ProtectedRoute>
                <ProfilePage />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/mood" 
            element={
              <ProtectedRoute>
                <MoodPage />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/wishlist" 
            element={
              <ProtectedRoute>
                <WishlistPage />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/moments" 
            element={
              <ProtectedRoute>
                <MomentPage />
              </ProtectedRoute>
            } 
          />
        </Routes>
      </Router>
    </ThemeProvider>
  );
}

export default App;