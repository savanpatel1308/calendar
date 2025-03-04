import React from "react";
import ReactDOM from "react-dom/client"; // ✅ Fix: Use "react-dom/client" instead of "react-dom"
import AppRouter from "./AppRouter";
import "./index.css";

const root = ReactDOM.createRoot(document.getElementById("root")); // ✅ Fix: Use createRoot
root.render(
    <React.StrictMode>
        <AppRouter />
    </React.StrictMode>
);

