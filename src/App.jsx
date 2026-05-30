import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, useParams, useLocation } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { ThemeProvider } from './context/ThemeContext';
import Auth from './pages/Auth';
import Chat from './pages/Chat';
import Home from './pages/Home';
import Create from './pages/Create';
import Reels from './pages/Reels';
import SearchPage from './pages/Search';
import Archive from './pages/Archive';
import Settings from './pages/Settings';
import Profile from './pages/Profile';
import Stories from './pages/Stories';
import Sidebar from './components/Sidebar';

const ProtectedRoute = ({ children }) => {
  const { token } = useAuth();
  return token ? children : <Navigate to="/login" />;
};

const ProfileWithKey = () => {
  const { userId } = useParams();
  return <Profile key={userId} />;
};

const MainLayout = ({ children }) => {
  const { token } = useAuth();
  const location = useLocation();

  // Don't show nav sidebar on auth, stories, chat pages
  const hideSidebar = !token || location.pathname.startsWith('/stories') || location.pathname.startsWith('/chat') || location.pathname === '/login';

  if (hideSidebar) {
    return <>{children}</>;
  }

  return (
    <div className="app-layout">
      <Sidebar />
      <div className="main-content">
        {children}
      </div>
    </div>
  );
};

const AppContent = () => {
  const { token } = useAuth();

  return (
    <Router>
      <MainLayout>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/login" element={token ? <Navigate to="/" /> : <Auth />} />
          <Route path="/chat" element={<ProtectedRoute><Chat /></ProtectedRoute>} />
          <Route path="/reels" element={<ProtectedRoute><Reels /></ProtectedRoute>} />
          <Route path="/search" element={<ProtectedRoute><SearchPage /></ProtectedRoute>} />
          <Route path="/create" element={<ProtectedRoute><Create /></ProtectedRoute>} />
          <Route path="/archive" element={<ProtectedRoute><Archive /></ProtectedRoute>} />
          <Route path="/settings" element={<ProtectedRoute><Settings /></ProtectedRoute>} />
          <Route path="/profile" element={<ProtectedRoute><Profile key="me" /></ProtectedRoute>} />
          <Route path="/profile/:userId" element={<ProtectedRoute><ProfileWithKey /></ProtectedRoute>} />
          <Route path="/stories/:userId" element={<ProtectedRoute><Stories /></ProtectedRoute>} />
          <Route path="*" element={<Navigate to="/" />} />
        </Routes>
      </MainLayout>
    </Router>
  );
};

function App() {
  return (
    <AuthProvider>
      <ThemeProvider>
        <AppContent />
      </ThemeProvider>
    </AuthProvider>
  );
}

export default App;
