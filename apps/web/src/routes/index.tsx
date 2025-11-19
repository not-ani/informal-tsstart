import { useQuery } from "@tanstack/react-query";
import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/")({
  component: RouterComponent,
});

function RouterComponent() {
  const { data: forms } = useQuery();
  return <div />;
}
