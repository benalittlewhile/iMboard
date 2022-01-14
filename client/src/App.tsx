import "./App.css";
import {
  BrowserRouter,
  Routes,
  Route,
  useNavigate,
  useParams,
} from "react-router-dom";
import Writer from "./writer/Writer";
import Reader from "./reader/Reader";

function App() {
  const id = useParams();
  console.log(`using id ${id}`);
  // if (page.includes("write")) {
  //   return <Writer />;
  // }
  // if (page.includes("read")) {
  //   return <Reader />;
  // }

  return (
    <div className="App">
      <BrowserRouter>
        <Routes>
          <Route path="/:id/write" element={<Writer />}></Route>
          <Route path="/:id/read" element={<Reader />}></Route>
        </Routes>
      </BrowserRouter>
    </div>
  );
}

export default App;

// <div className="App">
//   <header className="App-header">
//     <img src={logo} className="App-logo" alt="logo" />
//     <p>I'm blue dah boo dee dah boo dai</p>
//     <a
//       className="App-link"
//       href="https://reactjs.org"
//       target="_blank"
//       rel="noopener noreferrer"
//     >
//       Learn React
//     </a>
//   </header>
// </div>
