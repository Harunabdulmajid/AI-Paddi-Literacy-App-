
import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';

// Define global animation keyframes
const keyframes = `
@keyframes toast-in {
  from {
    transform: translateX(100%);
    opacity: 0;
  }
  to {
    transform: translateX(0);
    opacity: 1;
  }
}
.animate-toast-in {
  animation: toast-in 0.5s ease-out forwards;
}

@keyframes fade-in {
  from { opacity: 0; }
  to { opacity: 1; }
}
.animate-fade-in {
  animation: fade-in 0.3s ease-out forwards;
}

@keyframes slide-up {
    from { transform: translateY(20px); opacity: 0; }
    to { transform: translateY(0); opacity: 1; }
}
.animate-slide-up {
    animation: slide-up 0.4s ease-out forwards;
}
`;

// Inject keyframes into the document head
const styleSheet = document.createElement("style");
styleSheet.innerText = keyframes;
document.head.appendChild(styleSheet);


const rootElement = document.getElementById('root');
if (!rootElement) {
  throw new Error("Could not find root element to mount to");
}

const root = ReactDOM.createRoot(rootElement);
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);