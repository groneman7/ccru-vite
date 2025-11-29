import { withFieldGroup } from "@/components//form";
import {
  Button,
  Combobox,
  Field,
  FieldGroup,
  FieldLabel,
  Input,
} from "@/components/ui";
import type { Position, Shift, Slot, UserSchema } from "@/db/types";
import { cn } from "@/utils";
import { Minus, Plus, Search, Trash2 } from "lucide-react";

export type ShiftFormValue = Pick<Shift, "positionId" | "quantity" | "slots"> &
  Partial<Pick<Shift, "id" | "eventId">>;
export type UserForCombobox = Pick<UserSchema, "id" | "nameFirst" | "nameLast">;

export const ShiftFieldGroup = withFieldGroup<
  {
    shifts: ShiftFormValue[];
  },
  unknown,
  {
    positions: Position[];
    users: UserForCombobox[];
  }
>({
  render: ({ group, positions, users }) => {
    return (
      <>
        <Field>
          <group.Field mode="array" name="shifts">
            {(shiftsArrayField) => (
              <div className="flex flex-col gap-6">
                {shiftsArrayField.state.value.map((_, i) => {
                  const position = positions.find(
                    (p) => p.id === shiftsArrayField.state.value[i].positionId,
                  );
                  return (
                    //  Shift field
                    <FieldGroup key={i}>
                      {/* Underlined shift header with position title, slot quantity, and remove button */}
                      <div className="flex items-center justify-between gap-2 border-b border-muted-foreground pb-1">
                        {/* Position title */}
                        <span className="font-semibold">
                          {position?.label ??
                            position?.name ??
                            "Position not found???"}
                        </span>
                        <div className="flex items-center gap-1">
                          {/* shift slot quantity */}
                          <group.Field name={`shifts[${i}].quantity`}>
                            {(slotQuantityField) => {
                              const minSlots =
                                shiftsArrayField.state.value[i].slots.length;

                              return (
                                <div className="flex items-center gap-1">
                                  <Button
                                    disabled={
                                      slotQuantityField.state.value <=
                                      Math.max(minSlots, 1)
                                    }
                                    round
                                    size="icon-xs"
                                    variant="text"
                                    onClick={() =>
                                      slotQuantityField.handleChange(
                                        (v) => v - 1,
                                      )
                                    }
                                  >
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
                                      slotQuantityField.handleChange(
                                        Number(e.target.value),
                                      )
                                    }
                                  />
                                  <Button
                                    round
                                    size="icon-xs"
                                    type="button"
                                    variant="text"
                                    onClick={() =>
                                      slotQuantityField.handleChange(
                                        (v) => v + 1,
                                      )
                                    }
                                  >
                                    <Plus className="size-3" />
                                  </Button>
                                </div>
                              );
                            }}
                          </group.Field>
                          <Button
                            aria-label="Delete shift"
                            round
                            size="icon-xs"
                            type="button"
                            variant="text"
                            onClick={() => shiftsArrayField.removeValue(i)}
                          >
                            <Trash2 className="size-4" />
                          </Button>
                        </div>
                      </div>
                      {/* shift slots */}
                      <group.Field mode="array" name={`shifts[${i}].slots`}>
                        {(slotsArrayField) => {
                          const currentSlots =
                            group.state.values.shifts[i].slots;

                          return (
                            <div className="flex flex-col gap-1">
                              {slotsArrayField.state.value.map((_, j) => {
                                const selectedUser = currentSlots[j]?.user;
                                const availableUsers = users.filter(
                                  (user) =>
                                    !currentSlots.some(
                                      (slot, idx) =>
                                        idx !== j && slot.user.id === user.id,
                                    ),
                                );

                                return (
                                  <group.Field
                                    key={j}
                                    name={`shifts[${i}].slots[${j}]`}
                                  >
                                    {(slotUserIdField) => (
                                      <div className="flex items-center gap-1">
                                        {/* Remove slot button */}
                                        <Button
                                          round
                                          size="icon-xs"
                                          variant="text"
                                          onClick={() =>
                                            slotsArrayField.removeValue(j)
                                          }
                                        >
                                          <Minus className="size-4" />
                                        </Button>
                                        <Combobox
                                          // TODO: Integrate more advanced filtering? (e.g., put 'recommended' users at the top, fire a warning when assigning someone already assigned to another shift for the same event, etc.)
                                          options={
                                            selectedUser
                                              ? [
                                                  selectedUser,
                                                  ...availableUsers.filter(
                                                    (user) =>
                                                      user.id !==
                                                      selectedUser.id,
                                                  ),
                                                ]
                                              : availableUsers
                                          }
                                          suffix={<Search />}
                                          value={
                                            selectedUser?.id?.toString() ??
                                            undefined
                                          }
                                          variant="underlined"
                                          getId={(user) => user.id.toString()}
                                          getLabel={(user) =>
                                            `${user.nameFirst} ${user.nameLast}`
                                          }
                                          onSelect={(userId) => {
                                            if (!userId) return;

                                            const nextUser = users.find(
                                              (user) =>
                                                user.id.toString() ===
                                                userId.toString(),
                                            );
                                            if (!nextUser) return;

                                            slotUserIdField.handleChange(
                                              (slot) => ({
                                                ...slot,
                                                user: nextUser,
                                              }),
                                            );
                                          }}
                                        />
                                      </div>
                                    )}
                                  </group.Field>
                                );
                              })}
                              <Combobox
                                clearOnSelect
                                options={users.filter(
                                  (user) =>
                                    !group.state.values.shifts[i].slots.some(
                                      (s) => s.user.id === user.id,
                                    ),
                                )}
                                placeholder="Search users!..."
                                suffix={<Search />}
                                variant="underlined"
                                getId={(user) => user.id.toString()}
                                getLabel={(user) =>
                                  `${user.nameFirst} ${user.nameLast}`
                                }
                                onSelect={(userId) => {
                                  console.log(userId);
                                  if (!userId) return;

                                  const nextUser = users.find(
                                    (user) => user.id.toString() === userId,
                                  );
                                  console.log(nextUser);
                                  if (!nextUser) return;

                                  // 1. Add user to shift slots
                                  slotsArrayField.pushValue({
                                    id: Date.now(),
                                    user: nextUser,
                                  });
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
                          );
                        }}
                      </group.Field>
                    </FieldGroup>
                  );
                })}
                <Combobox
                  className={cn(
                    shiftsArrayField.state.value.length > 0 && "mt-1",
                  )}
                  clearOnSelect
                  options={positions?.filter(
                    (item) =>
                      !shiftsArrayField.state.value
                        .map((shift) => shift.positionId)
                        .includes(item.id),
                  )}
                  placeholder="Add a shift..."
                  suffix={<Search />}
                  getId={(option) => option.id.toString()}
                  render={(option) =>
                    option.label ? (
                      <div className="flex flex-1 items-center justify-between">
                        <span>{option.label}</span>
                        <span className="text-xs text-slate-400">
                          {option.name}
                        </span>
                      </div>
                    ) : (
                      <span>{option.name}</span>
                    )
                  }
                  onSelect={(value) =>
                    shiftsArrayField.pushValue({
                      positionId: Number(value),
                      quantity: 1,
                      slots: [] as Slot[],
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
