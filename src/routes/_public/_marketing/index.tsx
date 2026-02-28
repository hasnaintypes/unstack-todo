import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/_public/_marketing/")({
  component: RouteComponent,
});

function RouteComponent() {
  return <div>Hello "/_public/_marketing/"!</div>;
}
