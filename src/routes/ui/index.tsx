import { createFileRoute, Link } from "@tanstack/react-router";

export const Route = createFileRoute("/ui/")({
    component: RouteComponent,
});

function RouteComponent() {
    return (
        <div>
            <Link to="/ui/buttons">Buttons</Link>
        </div>
    );
}
