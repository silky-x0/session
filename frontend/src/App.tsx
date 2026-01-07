import { BrowserRouter, Routes, Route } from "react-router-dom";
import LandingPage from './pages/LandingPage';
import CodeEditor from "./components/Editor";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/editor" element={<CodeEditor />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
