import {BrowserRouter as Router, Routes, Route} from "react-router-dom";
import HomePage from "./pages/HomePage";
import UserHome from "./pages/UserHome";
import "./App.css"

function App() {

  return (
    <Router>
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/user" element={<UserHome />} />
      </Routes>
    </Router>
  );
}

export default App
