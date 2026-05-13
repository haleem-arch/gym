import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import TodayView from './pages/TodayView';
import BottomNav from './components/BottomNav';

function App() {
  return (
    <Router>
      <div className="flex flex-col h-screen bg-background text-gray-100 font-sans w-full max-w-[390px] mx-auto relative overflow-hidden shadow-2xl sm:border-x sm:border-gray-800">
        <div className="flex-1 overflow-y-auto pb-20 no-scrollbar">
          <Routes>
            <Route path="/" element={<TodayView />} />
            <Route path="/workout" element={<div className="p-4">Workout Tracker (Coming Soon)</div>} />
            <Route path="/diet" element={<div className="p-4">Diet Tracker (Coming Soon)</div>} />
            <Route path="/inbody" element={<div className="p-4">InBody (Coming Soon)</div>} />
            <Route path="/ai" element={<div className="p-4">AI Coach (Coming Soon)</div>} />
            <Route path="*" element={<Navigate to="/" />} />
          </Routes>
        </div>
        <BottomNav />
      </div>
    </Router>
  );
}

export default App;
