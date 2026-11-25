/* eslint-disable react-refresh/only-export-components -- build-time entry, never hot-reloaded */
import { StrictMode } from "react";
import { renderToString } from "react-dom/server";
import { StaticRouter } from "react-router-dom";
import AppRoutes from "./routes.tsx";

export { paths, channels, socials, SPONSOR_EMAIL, TAGLINE } from "./content.ts";

export function render(url: string) {
  return renderToString(
    <StrictMode>
      <StaticRouter location={url}>
        <AppRoutes />
      </StaticRouter>
    </StrictMode>,
  );
}
