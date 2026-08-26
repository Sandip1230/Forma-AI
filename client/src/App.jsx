import { Routes, Route } from "react-router-dom";
import Dashboard from "./pages/Dashboard";
import FormBuilder from "./pages/FormBuilder";
import Login from "./pages/Login";
import Signup from "./pages/Signup";
import Hub from "./pages/Hub";
import YourForms from "./pages/YourForms";
import CreateForm from "./pages/CreateForm";
import RequireAuth from "./components/RequireAuth";

function App() {
  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route path="/signup" element={<Signup />} />

      <Route
        path="/"
        element={
          <RequireAuth>
            <Hub />
          </RequireAuth>
        }
      />
      <Route
        path="/my-forms"
        element={
          <RequireAuth>
            <YourForms />
          </RequireAuth>
        }
      />
      <Route
        path="/forms/new"
        element={
          <RequireAuth>
            <CreateForm />
          </RequireAuth>
        }
      />
      <Route
        path="/admin"
        element={
          <RequireAuth adminOnly>
            <Dashboard />
          </RequireAuth>
        }
      />

      {/* Public — no login required to file a claim. */}
      <Route path="/forms/:formId" element={<FormBuilder />} />
    </Routes>
  );
}

export default App;