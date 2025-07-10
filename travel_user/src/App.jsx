import React from 'react'
import 'bootstrap/dist/css/bootstrap.min.css';
import { BrowserRouter, Route, Routes } from 'react-router-dom'
import Home from './page/Home';
import Login from './Components/Login';
import Register from './Components/Register';
import { Navbar } from './Components/Navbar';
function App() {
  return (
    <>
      <BrowserRouter>
        <Routes>
          <Route path='/' element={<Home />} />
          <Route path='/login' element={<Login />} />
          <Route path='/register' element={<Register />} />
          <Route path='/navbar' element={<Navbar />} />

        </Routes>
      </BrowserRouter>
    </>
  )
}

export default App