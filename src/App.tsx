import React from "react";
import { BrowserRouter as Router } from "react-router-dom";
import AppRouter from "./router/AppRouter";
import { Toaster } from "react-hot-toast";
function App() {
  return (
   <Router>
      <AppRouter />
        <Toaster position="top-center"   
        toastOptions={{
          style: {
            background: "#1e1f2e",
            color: "#fff",
            borderRadius: "12px",
            padding: "12px",
          },
        }} reverseOrder={false} />
    </Router>
  )
}

export default App
