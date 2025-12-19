import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App";
import { ErrorBoundary } from "./components/ErrorBoundary";
import "./index.css";

ReactDOM.createRoot(document.getElementById("root")).render(
  <ErrorBoundary fallback={<div className="text-white text-center mt-20">Something went wrong.</div>}>
    <App />
  </ErrorBoundary>
);
