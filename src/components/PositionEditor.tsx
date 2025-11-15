import { useAppForm } from "@/components/ui";
import { useStore } from "@tanstack/react-form";
import { useEffect } from "react";

type EventPositionDoc = Doc<"eventPositions">;

export function PositionEditor({ position }: { position: EventPositionDoc }) {
  const groups = useQuery(api.requirements.getRequirementsByPosition, {
    positionId: position._id,
  });
  const allAttributeValues = useQuery(api.attributes.getAllAttributeValues);

  const form = useAppForm({
    defaultValues: {
      name: position.name,
      requirementGroups: groups ?? [],
    },
  });

  useEffect(() => {
    if (!groups) return;

    const normalizedGroups = groups.map((group) => ({
      ...group,
      requirements: group.requirements.map((requirement) => ({
        ...requirement,
        allowedValueIds: [...requirement.allowedValueIds],
      })),
    }));

    form.setFieldValue("requirementGroups", normalizedGroups);
  }, [form, groups]);

  return (
    <div className="flex flex-1 gap-4">
      <form className="flex-2">
        <div>{position.name}</div>
        {groups?.map((requirementGroup, i) => (
          <div key={requirementGroup._id} className="ml-2 border p-2">
            {requirementGroup.requirements.map((requirement, j) => (
              <div key={requirement._id} className="mb-2">
                <div className="font-medium">
                  {requirement.attributeKeyLabel ??
                    requirement.attributeKeyName}
                </div>
                <form.AppField
                  name={`requirementGroups[${i}].requirements[${j}].allowedValueIds`}
                >
                  {(field) => (
                    <field.ComboboxField
                      multiple
                      getId={(attributeValue) => attributeValue._id}
                      getLabel={(attributeValue) =>
                        attributeValue.label || attributeValue.name
                      }
                      options={allAttributeValues?.filter(
                        (attributeValue) =>
                          attributeValue.keyId === requirement.attributeKeyId,
                      )}
                    />
                  )}
                </form.AppField>
              </div>
            ))}
          </div>
        ))}
      </form>
    </div>
  );
}
