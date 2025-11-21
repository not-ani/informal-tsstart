import { createFileRoute } from "@tanstack/react-router";
import { Hero } from "../components/hero";

export const Route = createFileRoute("/")({
  component: RouterComponent,
});

function RouterComponent() {
  return (
    <div>
      <Hero />
    </div>
  );
}
