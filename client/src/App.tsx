import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AppProvider } from './context/AppContext';
import ProfilePage from './pages/ProfilePage';
import InterviewPage from './pages/InterviewPage';
import PresentationPage from './pages/PresentationPage';
import AnalyticsPage from './pages/AnalyticsPage';

/**
 * Main App Component
 * 
 * Handles the application's routing and global state management.
 * The application flow is:
 * 1. User starts at ProfilePage (/)
 * 2. After profile creation, redirects to InterviewPage (/interview)
 * 3. User can switch to PresentationPage (/presentation)
 * 4. After recording, redirects to AnalyticsPage (/analytics)
 */
function App() {
  return (
    // AppProvider wraps the entire app to provide global state management
    <AppProvider>
      <Router>
        <Routes>
          {/* Default route - Profile creation/editing */}
          <Route path="/" element={<ProfilePage />} />
          
          {/* Interview practice mode */}
          <Route path="/interview" element={<InterviewPage />} />
          
          {/* Presentation practice mode */}
          <Route path="/presentation" element={<PresentationPage />} />
          
          {/* Analytics and feedback view */}
          <Route path="/analytics" element={<AnalyticsPage />} />
          
          {/* Redirect unknown routes to home */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </Router>
    </AppProvider>
  );
}

export default App;