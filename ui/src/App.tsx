import { useEffect, useRef, useState, useCallback } from 'react';
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
import { AuthModalProvider } from './components/auth/AuthModalContext';
import { useChat } from './hooks/useChat';
import ChatLauncher from './components/chat/ChatLauncher';
import ChatWindow from './components/chat/ChatWindow';

function App() {
  const { token, fetchUser } = useAuth();
  const fetchedUserOnStartup = useRef(false);
  const [isChatOpen, setIsChatOpen] = useState(false);
  const { messages, isLoading, sendMessage } = useChat();

  useEffect(() => {
    if (!token || fetchedUserOnStartup.current) {
      return;
    }

    fetchedUserOnStartup.current = true;
    fetchUser().catch(() => {
      // auth interceptor clears invalid token state on 401
    });
  }, [token, fetchUser]);

  const handleToggleChat = useCallback(() => {
    setIsChatOpen((prev) => !prev);
  }, []);

  const handleCloseChat = useCallback(() => {
    setIsChatOpen(false);
  }, []);

  return (
    <BrowserRouter>
      <AuthModalProvider>
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
      </AuthModalProvider>
      <ToastContainer
        position="top-right"
        autoClose={3000}
        hideProgressBar
        newestOnTop
        closeOnClick
        pauseOnHover
        theme="colored"
      />
      <ChatLauncher isOpen={isChatOpen} onToggle={handleToggleChat} />
      <ChatWindow
        isOpen={isChatOpen}
        onClose={handleCloseChat}
        messages={messages}
        isLoading={isLoading}
        onSendMessage={sendMessage}
      />
    </BrowserRouter>
  );
}

export default App;
