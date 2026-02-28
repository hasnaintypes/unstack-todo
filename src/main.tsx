import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { RouterProvider, createRouter } from "@tanstack/react-router";
import { AuthProvider } from "./context/auth-context";
import { useAuth } from "./hooks/use-auth";
import "./index.css";

// Import the generated route tree
import { routeTree } from "./routeTree.gen";

// Create a new router instance
const router = createRouter({
  routeTree,
  context: {
    auth: undefined!, // We'll inject this via the App component
  },
});

// Register the router instance for type safety
declare module "@tanstack/react-router" {
  interface Register {
    router: typeof router;
  }
}

function InnerApp() {
  const auth = useAuth();
  return <RouterProvider router={router} context={{ auth }} />;
}

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <AuthProvider>
      <InnerApp />
    </AuthProvider>
  </StrictMode>
);
