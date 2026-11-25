import { Routes, Route } from "react-router-dom";
import App from "./App.tsx";
import { paths } from "./content.ts";

export default function AppRoutes() {
  return (
    <Routes>
      {paths.map((p) => (
        <Route key={p} path={p} element={<App />} />
      ))}
    </Routes>
  );
}
