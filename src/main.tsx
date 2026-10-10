import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter, Routes, Route } from 'react-router-dom'
import './index.css'
import App from './App.tsx'
import RecipesIndex from './recipes/RecipesIndex.tsx'
import RecipePage from './recipes/RecipePage.tsx'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<App />} />
        <Route path="/apps" element={<App />} />
        <Route path="/games" element={<App />} />
        <Route path="/work" element={<App />} />
        <Route path="/awards" element={<App />} />
        <Route path="/recipes" element={<RecipesIndex />} />
        <Route path="/recipes/:slug" element={<RecipePage />} />
      </Routes>
    </BrowserRouter>
  </StrictMode>,
)
