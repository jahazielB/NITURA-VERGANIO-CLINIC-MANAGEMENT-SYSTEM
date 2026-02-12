import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./index.css";
import App from "./App.jsx";
import Router from "./routes/router.jsx";
import { Provider } from "react-redux";
import { store } from "./store/store.js";
import { initializeAuth } from "./store/authSlice.js";

store.dispatch(initializeAuth());

createRoot(document.getElementById("root")).render(
  <StrictMode>
    <Provider store={store}>
      <Router />
    </Provider>
  </StrictMode>,
);
