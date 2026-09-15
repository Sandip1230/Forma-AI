import { Routes, Route } from "react-router-dom";
import Dashboard from "./pages/Dashboard";
import FormBuilder from "./pages/FormBuilder";
import Login from "./pages/Login";
import Signup from "./pages/Signup";
import ForgotPassword from "./pages/ForgotPassword";
import Hub from "./pages/Hub";
import AllForms from "./pages/AllForms";
import CreateForm from "./pages/CreateForm";
import NotFound from "./pages/NotFound";
import RequireAuth from "./components/RequireAuth";

function App() {
  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route path="/signup" element={<Signup />} />
      <Route path="/forgot-password" element={<ForgotPassword />} />

      <Route
        path="/"
        element={
          <RequireAuth>
            <Hub />
          </RequireAuth>
        }
      />
      <Route
        path="/forms"
        element={
          <RequireAuth>
            <AllForms />
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
        path="/forms/:formId/edit"
        element={
          <RequireAuth>
            <CreateForm />
          </RequireAuth>
        }
      />
      <Route
        path="/dashboard"
        element={
          <RequireAuth>
            <Dashboard />
          </RequireAuth>
        }
      />

      {/* Public — no login required to file a claim. */}
      <Route path="/forms/:formId" element={<FormBuilder />} />

      <Route path="*" element={<NotFound />} />
    </Routes>
  );
}

export default App;
