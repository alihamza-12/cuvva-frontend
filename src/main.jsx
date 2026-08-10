import React from 'react';
import ReactDOM from 'react-dom/client';
import { Provider } from 'react-redux';
import { store } from './app/store';
import App from './App';
import './styles/index.css';

/*
 * Keep the installed mobile app at a fixed 100% page scale.
 *
 * The viewport meta tag is the primary zoom lock. These handlers cover
 * iOS standalone-mode gestures, where Safari can sometimes still begin a
 * pinch gesture despite user-scalable=no. They only block multi-touch and
 * Safari gesture events; normal one-finger scrolling continues to work.
 */
const isPhoneScreen = () => {
  const hasCoarsePointer = window.matchMedia?.('(pointer: coarse)').matches;
  const shortestSide = Math.min(window.screen.width, window.screen.height);

  return hasCoarsePointer && shortestSide <= 600;
};

const preventPhonePinchZoom = (event) => {
  if (isPhoneScreen() && event.touches?.length > 1) {
    event.preventDefault();
  }
};

const preventPhoneGestureZoom = (event) => {
  if (isPhoneScreen()) {
    event.preventDefault();
  }
};

document.addEventListener('touchstart', preventPhonePinchZoom, {
  passive: false,
});
document.addEventListener('touchmove', preventPhonePinchZoom, {
  passive: false,
});
document.addEventListener('gesturestart', preventPhoneGestureZoom, {
  passive: false,
});
document.addEventListener('gesturechange', preventPhoneGestureZoom, {
  passive: false,
});
document.addEventListener('gestureend', preventPhoneGestureZoom, {
  passive: false,
});

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <Provider store={store}>
      <App />
    </Provider>
  </React.StrictMode>
);