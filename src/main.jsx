import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './app/App'
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom'


ReactDOM.createRoot(document.getElementById('root')).render(
  <Router>
    <Routes>
      <Route path="/board/*" element={<App />} />
    </Routes>
  </Router>
)
