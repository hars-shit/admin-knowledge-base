import React from 'react'
import Home from './pages/Home'
import CreatePosts from './pages/CreatePosts'
import AllPosts from './pages/AllPosts'
import { ToastContainer } from 'react-toastify'
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom'

const App = () => {
  return (
    <Router>
      <ToastContainer
        position="top-right"
        autoClose={3000}
        hideProgressBar={false}
        newestOnTop={false}
        closeOnClick
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
      />
      <Routes>
            <Route path="/" element={<Navigate to="/posts" replace />} />
        <Route path="/posts/create" element={<CreatePosts />} />
        <Route path="/posts/update/:id" element={<CreatePosts />} />
        <Route path="/posts" element={<AllPosts />} />
      </Routes>
    </Router>
  )
}

export default App
