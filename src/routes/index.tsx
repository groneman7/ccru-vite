import { api } from "@/convex/_generated/api";
import type { Doc /*, Id */ } from "@/convex/_generated/dataModel";
import { createFileRoute } from "@tanstack/react-router";
import { useMutation, useQuery } from "convex/react";
import { Button, Input, InputGroup, InputGroupButton, InputGroupInput, useAppForm } from "@/src/components/ui";
import { useState } from "react";

type AttributeKeyDoc = Doc<"attributeKeys">;

export const Route = createFileRoute("/")({
    component: RouteComponent,
});

function Attribute({ attributeKey }: { attributeKey: AttributeKeyDoc }) {
    const attributeValuesByKey = useQuery(api.attributes.getAttributeValuesByKey, { keyId: attributeKey._id });
    const form = useAppForm({
        defaultValues: {
            description: attributeKey.description,
            label: attributeKey.label,
            name: attributeKey.name,
            values: attributeValuesByKey,
        },
    });

    const createAttributeValue = useMutation(api.attributes.createAttributeValue);
    const deleteAttributeValue = useMutation(api.attributes.deleteAttributeValue);

    return (
        <div className="flex flex-col gap-2">
            <form>
                <form.AppField name="name">{(field) => <field.TextField />}</form.AppField>
                <form.AppField
                    mode="array"
                    name="values">
                    {(field) => (
                        <div className="flex flex-col px-2">
                            {field.state.value?.map((_, i) => (
                                <form.AppField
                                    key={i}
                                    name={`values[${i}].name`}>
                                    {(subfield) => <subfield.TextField />}
                                </form.AppField>
                            ))}
                        </div>
                    )}
                </form.AppField>
            </form>
            {/* <div className="flex items-center gap-2">
                <span className="w-1/4 text-lg font-bold">{attributeKey.name}</span>
                <span className="flex-1 text-right text-xs text-slate-400">{attributeKey._id}</span>
            </div>
            <div className="flex flex-col gap-3 px-2">
                <div className="flex flex-col gap-1 text-sm">
                    {attributeValuesByKey && attributeValuesByKey.length > 0 ? (
                        attributeValuesByKey.map((value) => (
                            <div
                                key={value._id}
                                className="flex gap-2 items-center justify-between">
                                <Input
                                    size="sm"
                                    value={value.label}
                                />
                                <Input
                                    size="sm"
                                    value={value.name}
                                />
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
                </div> */}
            {/* <div className="flex gap-2">
                    <Input
                        size="sm"
                        value={value}
                        onChange={(e) => setValue(e.target.value)}
                    />
                    <Button
                        size="sm"
                        variant="filled"
                        onClick={() => {
                            createAttributeValue({ name: value, keyId: attributeKey._id });
                            setValue("");
                        }}>
                        Add
                    </Button>
                </div> */}
        </div>
    );
}

function RouteComponent() {
    const attributeKeys = useQuery(api.attributes.getAllAttributeKeys) || [];
    const positions = useQuery(api.positions.getAllPositions) || [];

    return (
        <div className="flex gap-4 h-full">
            <div className="flex flex-col gap-2 w-full p-4">
                <span className="text-2xl font-bold">User Attributes</span>
                <div className="flex flex-col gap-4 px-2">
                    {attributeKeys.map((k) => (
                        <Attribute
                            key={k._id}
                            attributeKey={k}
                        />
                    ))}
                </div>
            </div>
            {/* <div className="flex flex-col gap-2 w-96 p-4">
                <span className="text-2xl font-bold">Positions</span>
                <div className="flex flex-col gap-4 px-2">
                    {positions.map((p) => (
                        <div key={p._id}>
                            <span>{p.name}</span>
                        </div>
                    ))}
                </div>
            </div> */}
        </div>
    );
}
