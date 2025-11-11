import type { Doc, Id } from "@/convex/_generated/dataModel";
import {
  Button,
  Combobox,
  Field,
  FieldGroup,
  FieldLabel,
  Input,
  withFieldGroup,
} from "@/src/components/ui";
import { cn } from "@/src/components/utils";
import { Minus, Plus, Search } from "lucide-react";

type PositionDoc = Doc<"eventPositions">;
type UserDoc = Doc<"users">;

export type Shift = {
  positionId: string;
  slots: (Id<"users"> | null)[];
  quantity: number;
};

export const ShiftFieldGroup = withFieldGroup<
  {
    shifts: Shift[];
  },
  unknown,
  {
    users: UserDoc[];
    positions: PositionDoc[];
  }
>({
  props: {
    users: [],
    positions: [],
  },
  render: ({ group, positions, users }) => {
    return (
      <>
        <Field>
          <FieldLabel>Shifts</FieldLabel>
          <group.Field
            mode="array"
            name="shifts">
            {(shiftsArrayField) => (
              <div className="flex flex-col gap-6">
                {shiftsArrayField.state.value.map((_, i) => {
                  const position = positions.find(
                    (p) => p._id === shiftsArrayField.state.value[i].positionId
                  )!;
                  return (
                    //  Shift field
                    <FieldGroup key={i}>
                      <div className="border-b border-muted-foreground flex items-center justify-between gap-2 pb-1">
                        {/* position title */}
                        <span className="font-semibold">{position.label ?? position.name}</span>
                        {/* shift slot quantity */}
                        <group.Field name={`shifts[${i}].quantity`}>
                          {(slotQuantityField) => {
                            const minSlots = shiftsArrayField.state.value[i].slots.length;

                            return (
                              <div className="flex items-center gap-1">
                                <Button
                                  disabled={
                                    slotQuantityField.state.value <= Math.max(minSlots, 1)
                                  }
                                  round
                                  size="icon-xs"
                                  variant="text"
                                  onClick={() => slotQuantityField.handleChange((v) => v - 1)}>
                                  <Minus className="size-3" />
                                </Button>
                                <Input
                                  className="w-12 [&_input]:text-center"
                                  inputMode="numeric"
                                  size="sm"
                                  type="text"
                                  value={slotQuantityField.state.value}
                                  onBeforeInput={(e) => {
                                    if (
                                      e.nativeEvent.data &&
                                      !/^[0-9]+$/.test(e.nativeEvent.data)
                                    ) {
                                      e.preventDefault();
                                    }
                                  }}
                                  onBlur={(e) =>
                                    Number(e.target.value) < minSlots &&
                                    slotQuantityField.handleChange(minSlots)
                                  }
                                  onChange={(e) =>
                                    slotQuantityField.handleChange(Number(e.target.value))
                                  }
                                />
                                <Button
                                  round
                                  size="icon-xs"
                                  type="button"
                                  variant="text"
                                  onClick={() => slotQuantityField.handleChange((v) => v + 1)}>
                                  <Plus className="size-3" />
                                </Button>
                              </div>
                            );
                          }}
                        </group.Field>
                      </div>
                      {/* shift slots */}
                      <group.Field
                        mode="array"
                        name={`shifts[${i}].slots`}>
                        {(slotsArrayField) => (
                          <div className="flex flex-col gap-1">
                            {slotsArrayField.state.value.map((_, j) => (
                              <group.Field
                                key={j}
                                name={`shifts[${i}].slots[${j}]`}>
                                {(slotUserIdField) => (
                                  <div className="flex gap-1 items-center">
                                    {/* Remove slot button */}
                                    <Button
                                      round
                                      size="icon-xs"
                                      variant="text"
                                      onClick={() => slotsArrayField.removeValue(j)}>
                                      <Minus className="size-4" />
                                    </Button>
                                    <Combobox
                                      // TODO: Integrate more advanced filtering? (e.g., put 'recommended' users at the top, fire a warning when assigning someone already assigned to another shift for the same event, etc.)
                                      options={[
                                        // Puts the currently selected user at the top of the list
                                        users.find(
                                          (user) => user._id === slotUserIdField.state.value
                                        )!,
                                        // Filters out users already selected for this posiiton
                                        ...users.filter(
                                          (user) =>
                                            !group.state.values.shifts[i].slots.includes(
                                              user._id
                                            )
                                        ),
                                      ]}
                                      suffix={<Search />}
                                      value={slotUserIdField.state.value!}
                                      variant="underlined"
                                      getId={(user) => user._id}
                                      getLabel={(user) => `${user.firstName} ${user.lastName}`}
                                      onSelect={(value) =>
                                        slotUserIdField.handleChange(value as Id<"users">)
                                      }
                                    />
                                  </div>
                                )}
                              </group.Field>
                            ))}
                            <Combobox
                              clearOnSelect
                              options={users.filter(
                                (user) => !group.state.values.shifts[i].slots.includes(user._id)
                              )}
                              placeholder="Search users..."
                              suffix={<Search />}
                              variant="underlined"
                              getId={(user) => user._id}
                              getLabel={(user) => `${user.firstName} ${user.lastName}`}
                              onSelect={(value) => {
                                // 1. Add user to shift slots
                                slotsArrayField.pushValue(value as Id<"users">);
                                // 2. Update slot quantity if needed
                                if (
                                  slotsArrayField.state.value.length >
                                  group.state.values.shifts[i].quantity
                                ) {
                                  group.state.values.shifts[i].quantity =
                                    slotsArrayField.state.value.length;
                                }
                              }}
                            />
                          </div>
                        )}
                      </group.Field>
                    </FieldGroup>
                  );
                })}
                <Combobox
                  className={cn(shiftsArrayField.state.value.length > 0 && "mt-1")}
                  clearOnSelect
                  options={positions?.filter(
                    (item) =>
                      !shiftsArrayField.state.value
                        .map((shift) => shift.positionId)
                        .includes(item._id)
                  )}
                  placeholder="Add a shift..."
                  suffix={<Search />}
                  getId={(option) => option._id}
                  getLabel={(option) => option.label ?? option.name}
                  render={(option) =>
                    option.label ? (
                      <div className="flex flex-1 items-center justify-between">
                        <span>{option.label}</span>
                        <span className="text-xs text-slate-400">{option.name}</span>
                      </div>
                    ) : (
                      <span>{option.name}</span>
                    )
                  }
                  onSelect={(value) =>
                    shiftsArrayField.pushValue({
                      positionId: value as Id<"eventPositions">,
                      slots: [],
                      quantity: 1,
                    })
                  }
                />
              </div>
            )}
          </group.Field>
        </Field>
      </>
    );
  },
});
