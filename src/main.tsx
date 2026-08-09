import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter, Route, Routes } from 'react-router-dom'
import './index.css'
import App from './App.tsx'
import UploadListPage from './pages/UploadListPage.tsx'
import LabelPage from './pages/LabelPage.tsx'
import LeaderboardPage from './pages/LeaderboardPage.tsx'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<App />}>
          <Route index element={<UploadListPage />} />
          <Route path="label/:imageId" element={<LabelPage />} />
          <Route path="leaderboard" element={<LeaderboardPage />} />
        </Route>
      </Routes>
    </BrowserRouter>
  </StrictMode>,
)
