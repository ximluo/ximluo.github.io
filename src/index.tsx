import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import './index.css';
import App from './App';
import reportWebVitals from './reportWebVitals';
import CustomCursor from "./components/customCursor"

// Custom cursor wrapper component
const ConditionalCustomCursor = () => {
  const [isMobileOrTablet, setIsMobileOrTablet] = React.useState(false);

  React.useEffect(() => {
    const checkDevice = () => {
      const ua = navigator.userAgent;
      
      // Check for mobile/tablet using user agent
      const isMobileOrTabletDevice = (
        /Android/i.test(ua) || 
        /webOS/i.test(ua) || 
        /iPhone/i.test(ua) || 
        /iPad/i.test(ua) || 
        /iPod/i.test(ua) || 
        /BlackBerry/i.test(ua) || 
        /Windows Phone/i.test(ua) ||
        /Tablet/i.test(ua) ||
        // Additional check for touch screen devices
        ('ontouchstart' in window) ||
        (navigator.maxTouchPoints > 0)
      );
      
      setIsMobileOrTablet(isMobileOrTabletDevice);
    };

    // Check on mount
    checkDevice();
  }, []);

  // Only render the custom cursor on desktop (not mobile/tablet)
  return !isMobileOrTablet ? <CustomCursor /> : null;
};

const root = ReactDOM.createRoot(
  document.getElementById('root') as HTMLElement
);
root.render(
  <React.StrictMode>
    <BrowserRouter basename={process.env.PUBLIC_URL}>
        <ConditionalCustomCursor /> 
        <App />
    </BrowserRouter>
  </React.StrictMode>
);

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals();