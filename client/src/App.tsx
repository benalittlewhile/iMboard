import "./App.css";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Writer from "./writer/Writer";
import Reader from "./reader/Reader";

function App() {
  return (
    <Routes>
      <Route path="/write" element={<Writer />}></Route>
      <Route path="/read" element={<Reader />}></Route>
    </Routes>
  );
}

export default App;
