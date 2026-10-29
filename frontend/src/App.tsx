import { BrowserRouter, Routes, Route } from 'react-router-dom'
import Home from './pages/Home'
import Registro from './pages/Registro'
import Login from './pages/Login'
import Calendario from './pages/Calendario'
import MisCitas from './pages/MisCitas'

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/registro" element={<Registro />} />
        <Route path="/login" element={<Login />} />
        <Route path="/calendario" element={<Calendario />} />
        <Route path="/mis-citas" element={<MisCitas />} />
      </Routes>
    </BrowserRouter>
  )
}

export default App
