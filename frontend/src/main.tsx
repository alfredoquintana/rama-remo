import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { App } from './app/App';
import { getStoredTheme } from './app/session';
import { defaultThemeId, isThemeId } from './app/theme';
import './index.css';

const storedTheme = getStoredTheme();
document.documentElement.dataset.theme = isThemeId(storedTheme)
  ? storedTheme
  : defaultThemeId;

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
);
