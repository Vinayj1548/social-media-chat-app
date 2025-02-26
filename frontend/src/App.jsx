import React from 'react'
import { useState , useEffect } from 'react'
import 'bootstrap/dist/css/bootstrap.min.css';
import Navbar from './components/Navbar'
import Form from './components/Form'
import LoginForm from './components/LoginForm'
import { BrowserRouter as Router , Route , Routes, BrowserRouter } from 'react-router-dom'
import "./index.css";
import "./App.css";




const App = () => {

  return (
    <Router>
    <Navbar title="Social-Media"/>
    <div className="flex justify-center bg-[#504673] w-screen items-center h-screen">
        <Routes>
          <Route path="/login" element={<LoginForm/>} />
          <Route path="/signup" element={<Form/>} />
        </Routes>
    </div>
    </Router>
  )
}

export default App