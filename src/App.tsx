import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { BookProvider, useBook } from './BookContext';
import Layout from './components/Layout';
import BookSelection from './pages/BookSelection';
import Entities from './pages/Entities';
import Timeline from './pages/Timeline';
import Chapters from './pages/Chapters';
import Brainstorm from './pages/Brainstorm';

function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { currentBook } = useBook();

  if (!currentBook) {
    return <Navigate to="/" replace />;
  }

  return <Layout>{children}</Layout>;
}

function AppRoutes() {
  return (
    <Routes>
      <Route path="/" element={<BookSelection />} />
      <Route
        path="/entities"
        element={
          <ProtectedRoute>
            <Entities />
          </ProtectedRoute>
        }
      />
      <Route
        path="/timeline"
        element={
          <ProtectedRoute>
            <Timeline />
          </ProtectedRoute>
        }
      />
      <Route
        path="/chapters"
        element={
          <ProtectedRoute>
            <Chapters />
          </ProtectedRoute>
        }
      />
      <Route
        path="/brainstorm"
        element={
          <ProtectedRoute>
            <Brainstorm />
          </ProtectedRoute>
        }
      />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

function App() {
  return (
    <BookProvider>
      <Router>
        <AppRoutes />
      </Router>
    </BookProvider>
  );
}

export default App;
