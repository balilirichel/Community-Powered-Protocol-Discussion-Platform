import { useEffect, useRef } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { ToastContainer } from 'react-toastify';
import HomePage from './pages/HomePage';
import ProtocolDetailPage from './pages/ProtocolDetailPage';
import CreateProtocolPage from './pages/CreateProtocolPage';
import ThreadDetailsPage from './pages/ThreadDetailsPage';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import ThreadPage from './pages/ThreadPage';
import ProfilePage from './pages/ProfilePage';
import { ProtectedRoute } from './components/ProtectedRoute';
import { PublicRoute } from './components/PublicRoute';
import { useAuth } from './hooks/useAuth';

function App() {
  const { token, fetchUser } = useAuth();
  const fetchedUserOnStartup = useRef(false);

  useEffect(() => {
    if (!token || fetchedUserOnStartup.current) {
      return;
    }

    fetchedUserOnStartup.current = true;
    fetchUser().catch(() => {
      // auth interceptor clears invalid token state on 401
    });
  }, [token, fetchUser]);

  return (
    <BrowserRouter>
      <Routes>
        {/* Public routes */}
        <Route
          path="/login"
          element={
              <PublicRoute>
                <LoginPage />
              </PublicRoute>
          
          }
        />
        <Route
          path="/register"
          element={
               <PublicRoute>
                <RegisterPage />
              </PublicRoute>
          }
        />
        {/* Protected routes */}
        <Route
          path="/"
          element={
              <HomePage />
         
          }
        />
        <Route
          path="/threads"
          element={       
              <ThreadPage />
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
          path="/protocols/create"
          element={
            <ProtectedRoute>
              <CreateProtocolPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/protocols/:slug"
          element={
              <ProtocolDetailPage />
          }
        />
        <Route
          path="/threads/:id"
          element={
              <ThreadDetailsPage />
          }
        />

        {/* Fallback */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
      <ToastContainer
        position="top-right"
        autoClose={3000}
        hideProgressBar
        newestOnTop
        closeOnClick
        pauseOnHover
        theme="colored"
      />
    </BrowserRouter>
  );
}

export default App;
