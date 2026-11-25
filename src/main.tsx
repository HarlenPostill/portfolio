import { StrictMode } from 'react'
import { hydrateRoot } from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import './index.css'
import AppRoutes from './routes.tsx'

// The HTML is prerendered at build time (see scripts/prerender.mjs), so
// hydrate it instead of rendering from scratch.
hydrateRoot(
  document.getElementById('root')!,
  <StrictMode>
    <BrowserRouter>
      <AppRoutes />
    </BrowserRouter>
  </StrictMode>,
)
