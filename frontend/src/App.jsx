import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { AuthProvider } from './AuthContext'
import Navbar from './components/Navbar'
import ProtectedRoute from './components/ProtectedRoute'
import Landing from './pages/Landing'
import Chat from './pages/Chat'
import Flights from './pages/Flights'
import Hotels from './pages/Hotels'
import PackVote from './pages/PackVote'
import PhotoSearch from './pages/PhotoSearch'
import Itinerary from './pages/Itinerary'
import RegretScore from './pages/RegretScore'
import DestinationDetail from './pages/DestinationDetail'
import Memories from './pages/Memories'
import Login from './pages/Login'

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Navbar />
        <Routes>
          <Route path="/login" element={<Login />} />
          
          <Route element={<ProtectedRoute />}>
            <Route path="/" element={<Landing />} />
            <Route path="/chat" element={<Chat />} />
            <Route path="/flights" element={<Flights />} />
            <Route path="/hotels" element={<Hotels />} />
            <Route path="/packvote" element={<PackVote />} />
            <Route path="/photo" element={<PhotoSearch />} />
            <Route path="/itinerary" element={<Itinerary />} />
            <Route path="/regret" element={<RegretScore />} />
            <Route path="/destination/:name" element={<DestinationDetail />} />
            <Route path="/memories" element={<Memories />} />
          </Route>
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  )
}
