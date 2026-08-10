import React from 'react';
import ReactDOM from 'react-dom/client';
import { Provider } from 'react-redux';

import { store } from './app/store';
import App from './App';

import './styles/index.css';

/*
 * Keep the installed phone application at its configured scale.
 * Phones use 85% and larger screens use 100%.
 */
const isPhoneScreen = () => {
  const hasCoarsePointer =
    window.matchMedia?.('(pointer: coarse)').matches;

  const shortestSide = Math.min(
    window.screen.width,
    window.screen.height
  );

  return hasCoarsePointer && shortestSide <= 600;
};

/*
 * Prevent pinch zoom while allowing normal one-finger scrolling.
 */
const preventPhonePinchZoom = (event) => {
  if (isPhoneScreen() && event.touches?.length > 1) {
    event.preventDefault();
  }
};

/*
 * Prevent Safari gesture zoom in standalone PWA mode.
 */
const preventPhoneGestureZoom = (event) => {
  if (isPhoneScreen()) {
    event.preventDefault();
  }
};

document.addEventListener(
  'touchstart',
  preventPhonePinchZoom,
  {
    passive: false,
  }
);

document.addEventListener(
  'touchmove',
  preventPhonePinchZoom,
  {
    passive: false,
  }
);

document.addEventListener(
  'gesturestart',
  preventPhoneGestureZoom,
  {
    passive: false,
  }
);

document.addEventListener(
  'gesturechange',
  preventPhoneGestureZoom,
  {
    passive: false,
  }
);

document.addEventListener(
  'gestureend',
  preventPhoneGestureZoom,
  {
    passive: false,
  }
);

ReactDOM.createRoot(
  document.getElementById('root')
).render(
  <React.StrictMode>
    <Provider store={store}>
      <App />
    </Provider>
  </React.StrictMode>
);