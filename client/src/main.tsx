import { createRoot } from "react-dom/client";
import App from "./App";
import "./index.css";

// Add custom styles for Playfair Display and Open Sans fonts
const style = document.createElement('style');
style.textContent = `
  :root {
    --font-display: 'Playfair Display', serif;
    --font-body: 'Open Sans', sans-serif;
  }
  
  h1, h2, h3, h4, h5, h6 {
    font-family: var(--font-display);
  }
  
  body {
    font-family: var(--font-body);
  }
`;
document.head.appendChild(style);

createRoot(document.getElementById("root")!).render(<App />);
