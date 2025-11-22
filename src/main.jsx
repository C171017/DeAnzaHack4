import React from 'react'
import ReactDOM from 'react-dom/client'
import { BrowserRouter, Routes, Route } from 'react-router-dom'
import App from './App.jsx'
import Callback from './Callback.jsx'
import BlankPage from './components/BlankPage.jsx'
import Page3 from './components/Page3.jsx'
import Page4 from './components/Page4.jsx'
import './index.css'

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<App />} />
        <Route path="/callback" element={<Callback />} />
        <Route path="/blank" element={<BlankPage />} />
        <Route path="/page3" element={<Page3 />} />
        <Route path="/page4" element={<Page4 />} />
      </Routes>
    </BrowserRouter>
  </React.StrictMode>,
)

