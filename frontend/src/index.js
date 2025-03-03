import React from 'react';
import ReactDOM from 'react-dom/client';
import './styles/main.css'; // Import our new main styles
import App from './App';
import { BrowserRouter as Router } from 'react-router-dom';
import { MockAuthProvider } from './context/MockAuthContext';

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    <Router>
      <MockAuthProvider>
        <App />
      </MockAuthProvider>
    </Router>
  </React.StrictMode>
);