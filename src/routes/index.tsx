import { api } from "@/convex/_generated/api";
import type { Id } from "@/convex/_generated/dataModel";
import { createFileRoute } from "@tanstack/react-router";
import { useMutation, useQuery } from "convex/react";
import { Button, Input } from "@/src/components/ui";
import { useState } from "react";

export const Route = createFileRoute("/")({
    component: RouteComponent,
});

function Test({ attributeKey }: { attributeKey: Id<"attributeKeys"> }) {
    const [value, setValue] = useState("");
    const attributeValuesByKey = useQuery(api.attributes.getAttributeValuesByKey, { keyId: attributeKey });
    const createAttributeValue = useMutation(api.attributes.createAttributeValue);
    const deleteAttributeValue = useMutation(api.attributes.deleteAttributeValue);

    return (
        <div className="flex flex-col gap-3 px-2">
            <div className="flex flex-col gap-1 text-sm">
                {attributeValuesByKey && attributeValuesByKey.length > 0 ? (
                    attributeValuesByKey.map((value) => (
                        <div
                            key={value._id}
                            className="flex items-center justify-between">
                            <span>{value.name}</span>
                            <Button
                                size="sm"
                                variant="filled"
                                onClick={() => deleteAttributeValue({ id: value._id })}>
                                Delete
                            </Button>
                        </div>
                    ))
                ) : (
                    <span className="text-slate-500">No attribute value added.</span>
                )}
            </div>
            <div className="flex gap-2">
                <Input
                    value={value}
                    onChange={(e) => setValue(e.target.value)}
                />
                <Button
                    variant="filled"
                    onClick={() => {
                        createAttributeValue({ name: value, keyId: attributeKey });
                        setValue("");
                    }}>
                    Add
                </Button>
            </div>
        </div>
    );
}

function RouteComponent() {
    const attributeKeys = useQuery(api.attributes.getAllAttributeKeys) || [];

    return (
        <div className="flex flex-col gap-2 w-96 p-4">
            <span className="text-xl font-bold">User Attributes</span>
            <div className="flex flex-col gap-4 px-2">
                {attributeKeys.map((key) => (
                    <div
                        key={key._id}
                        className="flex flex-col gap-2">
                        <span>{key.name}</span>
                        <Test attributeKey={key._id} />
                    </div>
                ))}
            </div>
        </div>
    );
}
