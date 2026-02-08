import React from "react";
import { createRoot } from "react-dom/client";
import RoboDesk from "../robodesk.jsx";

// Polyfill window.storage (Claude Artifact API) using localStorage
window.storage = {
  async get(key) {
    const value = localStorage.getItem(key);
    return value !== null ? { value } : {};
  },
  async set(key, value) {
    localStorage.setItem(key, value);
  },
};

createRoot(document.getElementById("root")).render(<RoboDesk />);
