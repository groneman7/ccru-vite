import { api } from "api";
import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "convex/react";
import { PositionEditor } from "@/src/components/PositionEditor";

export const Route = createFileRoute("/admin/positions")({
    component: RouteComponent,
});

function RouteComponent() {
    const positions = useQuery(api.positions.getAllPositions);
    if (!positions) return null;

    return (
        <div className="flex flex-col gap-4 p-4">
            <h1 className="text-2xl font-bold">Event Positions</h1>

            {/* <div className="border rounded-lg p-4 bg-white">
                <h2 className="font-semibold mb-2">Create New Position</h2>
                <div className="flex flex-col gap-2">
                    <input
                        className="border p-2 rounded"
                        placeholder="Position name"
                        value={newName}
                        onChange={(e) => setNewName(e.target.value)}
                    />
                    <input
                        className="border p-2 rounded"
                        placeholder="Label (optional)"
                        value={newLabel}
                        onChange={(e) => setNewLabel(e.target.value)}
                    />
                    <textarea
                        className="border p-2 rounded"
                        placeholder="Description (optional)"
                        value={newDescription}
                        onChange={(e) => setNewDescription(e.target.value)}
                    />
                    <button
                        onClick={handleCreate}
                        className="bg-primary text-white rounded p-2 font-semibold hover:bg-primary/90">
                        Create
                    </button>
                </div>
            </div> */}

            <div className="flex flex-col gap-4">
                {positions.map((p) => (
                    <PositionEditor
                        key={p._id}
                        position={p}
                    />
                ))}
            </div>
        </div>
    );
}
