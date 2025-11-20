import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/")({
  component: RouterComponent,
});

function RouterComponent() {
  return <div></div>;
}
