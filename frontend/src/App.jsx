import Landing from './pages/Landing.jsx'
import Register from './pages/Register.jsx'
import Login from './pages/Login.jsx'
import { Routes,Route } from 'react-router-dom'
import ContestTracker from './pages/ContestTracker.jsx'
import Profile from './pages/Profile.jsx'
import EditProfile from './pages/EditProfile.jsx'
import VerifyHandles from './pages/VerifyHandles.jsx'


function App() {
  
  return (
    <Routes>
      <Route path="/" element={<Landing />} />
      <Route path="/register" element={<Register />} />
      <Route path="/login" element={<Login />} />
      <Route path="/contest-tracker" element={<ContestTracker/>}/>
      <Route path="/profile" element={<Profile/>}/>
      <Route path="/edit-profile" element={<EditProfile/>}/>
      <Route path="/verify-handles" element={<VerifyHandles/>}/>

    </Routes>
  )
}

export default App
