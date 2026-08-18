import { Routes, Route, Navigate } from "react-router-dom";
import FormBuilder from "./pages/FormBuilder";

function App() {
  return (
    <Routes>
      <Route path="/" element={<Navigate to="/forms/claim-demo" replace />} />
      <Route path="/forms/:formId" element={<FormBuilder />} />
    </Routes>
  );
}

export default App;