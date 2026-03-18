import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { Provider } from "react-redux";
import { store } from "./store";
import Dashboard from "./pages/Dashboard";
import ConfigureDashboard from "./pages/ConfigureDashboard";
import Orders from "./pages/Orders";
import Sidebar from "./components/Sidebar";

function App() {
  return (
    <Provider store={store}>
      <Router>
        <div className="flex min-h-screen bg-gray-50">
          <Sidebar />
          <main className="flex-1 overflow-auto">
            <Routes>
              <Route path="/" element={<Dashboard />} />
              <Route path="/configure" element={<ConfigureDashboard />} />
              <Route path="/orders" element={<Orders />} />
            </Routes>
          </main>
        </div>
      </Router>
    </Provider>
  );
}

export default App;
