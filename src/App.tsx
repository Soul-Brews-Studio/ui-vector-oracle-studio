import { BrowserRouter, Routes, Route } from 'react-router-dom'
import Playground from './pages/Playground'

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Playground />} />
      </Routes>
    </BrowserRouter>
  )
}
