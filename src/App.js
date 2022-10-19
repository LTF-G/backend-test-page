import "./App.css";
import { Routes, Route } from "react-router-dom";
import Selector from "./components/Testers/selector";
import Device from "./components/Testers/device";
import Mobile from "./components/Testers/mobile";
import Login from "./components/Auth/login";
import Register from "./components/Auth/register";
import Master from "./components/VideoStreamPlayer/master";
import Viewer from "./components/VideoStreamPlayer/viewer";

function App() {
    return (
        <div className="App">
            <Routes>
                <Route path="/" element={<Selector />}></Route>
                <Route path="/login" element={<Login />}></Route>
                <Route path="/register" element={<Register />}></Route>
                <Route path="/device" element={<Device />}></Route>
                <Route path="/mobile" element={<Mobile />}></Route>
                <Route path="/master/:channelName" element={<Master />}></Route>
                <Route path="/viewer/:channelName" element={<Viewer />}></Route>
            </Routes>
        </div>
    );
}

export default App;
