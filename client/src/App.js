import { Routes, Route } from 'react-router-dom';
import Landing from './pages/Landing';
import JoinFamily from './pages/Joinfamily';

function App() {
  return (
    <Routes>
      <Route path="/" element={<Landing />} />
      <Route path="/joinfamily" element={<JoinFamily />} /> {/* Add route for JoinFamily */}
    </Routes>
  );
}

export default App;