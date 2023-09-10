

// This is where we put the root component for our application.
// You render the <html> element here.

import { LiveReload, Outlet, Links } from "@remix-run/react";
import type { LinksFunction } from "@remix-run/node";

import globalLargeStylesUrl from "~/styles/global-large.css";
import globalMediumStylesUrl from "~/styles/global-medium.css";
import globalStylesUrl from "~/styles/global.css";

export const links: LinksFunction = () => [
  { rel: "stylesheet", href: globalStylesUrl },
  {
    rel: "stylesheet",
    href: globalMediumStylesUrl,
    media: "print, (min-width: 640px)",
  },
  {
    rel: "stylesheet",
    href: globalLargeStylesUrl,
    media: "screen and (min-width: 1024px)",
  },
];

export default function App() {
  return (
    <html lang="en">
      <head>
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width,initial-scale=1" />
        <title>Remix: So great, it's funny!</title>
        <Links />
      </head>
      <body>
        <Outlet />
        {/* routes/index를 불러오는 역할 */}
        <LiveReload />
        {/* <LiveReload /> component is useful during development to 
        auto-refresh our browser whenever we make a change.  */}
      </body>
    </html>
  );
}
