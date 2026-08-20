import { Routes, Route } from "react-router-dom";
import Dashboard from "./pages/Dashboard";
import FormBuilder from "./pages/FormBuilder";

function App() {
  return (
    <Routes>
      <Route path="/" element={<Dashboard />} />
      <Route path="/forms/:formId" element={<FormBuilder />} />
    </Routes>
  );
}

export default App;