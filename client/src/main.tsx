/**
 * Application Entry Point
 * 
 * This is the main entry point for the React application.
 * It sets up:
 * - React 18's createRoot for concurrent features
 * - StrictMode for development checks
 * - Global styles through index.css
 */
import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import App from './App.tsx';
import './index.css';

// Create root using React 18's concurrent features
createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>
);