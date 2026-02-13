import { IconAlignLeft, IconTrash } from "@tabler/icons-react";
import { useStore } from "@tanstack/react-form";
import { useMutation, useQuery } from "@tanstack/react-query";
import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { AddressFieldGroup } from "~/client/components/event-form/address-field-group";
import { DescFieldGroup } from "~/client/components/event-form/desc-field-group";
import { useAppForm } from "~/client/components/form";
import {
  Button,
  Card,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
  Combobox,
  ComboboxContent,
  ComboboxEmpty,
  ComboboxInput,
  ComboboxItem,
  ComboboxList,
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  Field,
  FieldLabel,
  Input,
  Popover,
  PopoverClose,
  PopoverContent,
  PopoverHeader,
  PopoverTitle,
  PopoverTrigger,
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "~/client/components/ui";
import { queryClient, trpc } from "~/client/lib/router";
import { cn, parseAndFormatTime } from "~/client/utils";
import type { Position, TemplatePosition } from "~/shared/types";
import dayjs from "dayjs";
import {
  Check,
  CheckIcon,
  Clock,
  MapPin,
  Minus,
  PencilIcon,
  Plus,
  PlusIcon,
  TextAlignStart,
  X,
  XIcon,
} from "lucide-react";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { iso, literal, object, string, union, null as zNull } from "zod";

const timeSchema = string().regex(
  /^(?:[01]\d|2[0-3]):[0-5]\d(?::[0-5]\d)?$/,
  "Please enter a valid time.",
);

export const Route = createFileRoute("/_app/calendar/templates/$templateId")({
  loader: async ({
    context: { trpc, queryClient },
    params: { templateId },
  }) => {
    await queryClient.ensureQueryData(
      trpc.calendar.templates.getTemplateById.queryOptions({ templateId }),
    );
    await queryClient.ensureQueryData(
      trpc.calendar.templates.getTemplatePositionsByTemplateId.queryOptions({
        templateId,
      }),
    );
  },
  component: RouteComponent,
  head: () => ({
    meta: [{ title: "CCRU | Event Template" }],
  }),
});

function RouteComponent() {
  const { templateId } = Route.useParams();
  const nav = useNavigate();
  const [isEditing, setIsEditing] = useState(false);
  const [expandedDescriptions, setExpandedDescriptions] = useState<Set<string>>(
    new Set(),
  );

  const templateDetailsKey = trpc.calendar.templates.getTemplateById.queryKey({
    templateId,
  });
  const templatesListKey = trpc.calendar.templates.listAllTemplates.queryKey();

  const { data: template, isLoading: templateIsLoading } = useQuery(
    trpc.calendar.templates.getTemplateById.queryOptions({ templateId }),
  );
  const { data: templatePositions, isLoading: templatePositionsIsLoading } =
    useQuery(
      trpc.calendar.templates.getTemplatePositionsByTemplateId.queryOptions({
        templateId,
      }),
    );

  const { mutateAsync: updateTemplate, isPending: isSavingDetails } =
    useMutation(
      trpc.calendar.templates.updateTemplateDetails.mutationOptions({
        onError: () => {
          toast.error("Failed to save template details.");
        },
        onSuccess: () => {
          toast.success("Template details saved.");
        },
        onSettled: async () => {
          await queryClient.invalidateQueries({ queryKey: templateDetailsKey });
          await queryClient.invalidateQueries({ queryKey: templatesListKey });
        },
      }),
    );
  const { mutateAsync: createEventFromTemplate, isPending: isCreatingEvent } =
    useMutation(
      trpc.calendar.templates.createEventFromTemplate.mutationOptions({
        onSettled: async () => {
          await queryClient.invalidateQueries({
            queryKey: trpc.calendar.events.listEventsByMonth.queryKey(),
          });
        },
      }),
    );

  const form = useAppForm({
    defaultValues: {
      name: template?.name ?? "",
      eventName: template?.display ?? "",
      description: template?.description ?? "",
      location: template?.location ?? "",
      timeBegin: template?.timeBegin ?? "",
      timeEnd: template?.timeEnd ?? "",
    },
    validators: {
      onSubmit: object({
        name: string().min(1, "Please enter a template name."),
        eventName: string().min(1, "Please enter an event name."),
        description: union([string(), zNull()]),
        location: union([string(), zNull()]),
        timeBegin: timeSchema,
        timeEnd: union([timeSchema, literal(""), zNull()]),
      }),
    },
    onSubmit: async ({ value }) => {
      const normalizedTimeBegin =
        parseAndFormatTime(value.timeBegin)?.iso ?? value.timeBegin;
      const normalizedTimeEnd = value.timeEnd
        ? (parseAndFormatTime(value.timeEnd)?.iso ?? value.timeEnd)
        : null;

      await updateTemplate({
        templateId,
        name: value.name.trim(),
        eventName: value.eventName.trim(),
        description: value.description || null,
        location: value.location || null,
        timeBegin: normalizedTimeBegin,
        timeEnd: normalizedTimeEnd,
      });
      setIsEditing(false);
    },
  });

  useEffect(() => {
    if (!template) return;
    form.reset({
      name: template.name,
      eventName: template.display,
      description: template.description ?? "",
      location: template.location ?? "",
      timeBegin: template.timeBegin,
      timeEnd: template.timeEnd ?? "",
    });
    setIsEditing(false);
  }, [form, template]);

  if (templateIsLoading || templatePositionsIsLoading) {
    return <div>Loading template</div>;
  }
  if (!template) return <div>Template not found</div>;

  const formatTime = (time: string | null) =>
    time ? dayjs(`1970-01-01T${time}`).format("h:mm A") : null;

  return (
    <div className="flex flex-1 flex-col gap-8 lg:flex-row">
      <div className="flex flex-1 flex-col gap-2 lg:max-w-md">
        <div className="flex items-center justify-between gap-2">
          <span className="text-xl font-semibold">Details</span>
          <div className="flex items-center gap-2">
            {!isEditing && (
              <Button size="sm" onClick={() => setIsEditing(true)}>
                <PencilIcon />
                Edit
              </Button>
            )}
            <DialogCreateEventFromTemplate
              isPending={isCreatingEvent}
              onCreateEvent={async (date) => {
                const eventId = await createEventFromTemplate({
                  templateId,
                  date,
                  // TODO: replace with session user
                  createdBy: "019bf727-12a8-7b06-b286-59e7719468c0",
                });

                nav({
                  to: "/calendar/events/$eventId",
                  params: { eventId },
                });
              }}
            />
          </div>
        </div>
        {isEditing ? (
          <form
            className="flex flex-1 flex-col gap-2"
            onSubmit={(e) => {
              e.preventDefault();
              form.handleSubmit();
            }}
          >
            <form.Field name="name">
              {(nameField) => (
                <Field>
                  <FieldLabel htmlFor={nameField.name}>Name</FieldLabel>
                  <Input
                    id={nameField.name}
                    name={nameField.name}
                    value={nameField.state.value}
                    onBlur={nameField.handleBlur}
                    onChange={(e) => nameField.handleChange(e.target.value)}
                  />
                </Field>
              )}
            </form.Field>
            <form.Field name="eventName">
              {(eventNameField) => (
                <Field>
                  <FieldLabel htmlFor={eventNameField.name}>
                    Event name
                  </FieldLabel>
                  <Input
                    id={eventNameField.name}
                    name={eventNameField.name}
                    value={eventNameField.state.value}
                    onBlur={eventNameField.handleBlur}
                    onChange={(e) =>
                      eventNameField.handleChange(e.target.value)
                    }
                  />
                </Field>
              )}
            </form.Field>
            <div className="flex gap-2">
              <form.AppField name="timeBegin">
                {(field) => (
                  <field.TimeField
                    label="Start time"
                    placeholder="e.g., 1:00 PM or 1300"
                  />
                )}
              </form.AppField>
              <form.AppField name="timeEnd">
                {(field) => (
                  <field.TimeField
                    label="End time"
                    placeholder="e.g., 1:00 PM or 1300"
                  />
                )}
              </form.AppField>
            </div>
            <AddressFieldGroup form={form} fields={{ location: "location" }} />
            <DescFieldGroup
              form={form}
              fields={{ eventName: "eventName", description: "description" }}
            />
            <div className="flex items-center justify-end gap-2">
              <Button
                disabled={isSavingDetails}
                onClick={() => {
                  form.reset();
                  setIsEditing(false);
                }}
                type="button"
              >
                <XIcon />
                Cancel
              </Button>
              <Button
                disabled={isSavingDetails}
                variant="solid"
                onClick={() => form.handleSubmit()}
              >
                <CheckIcon />
                Save
              </Button>
            </div>
          </form>
        ) : (
          <div className="flex flex-col gap-4">
            <div className="flex items-center gap-2">
              <Clock className="size-4" />
              <span className="flex-1">{`${formatTime(template.timeBegin)}${template.timeEnd ? ` - ${formatTime(template.timeEnd)}` : ""}`}</span>
            </div>
            {template.location && (
              <div className="flex items-center gap-2">
                <MapPin className="size-4" />
                <span className="flex-1">{template.location}</span>
              </div>
            )}
            {template.description && (
              <div className="flex items-start gap-2">
                <TextAlignStart className="mt-1 size-4" />
                <span className="flex-1">{template.description}</span>
              </div>
            )}
          </div>
        )}
      </div>

      <div className="flex flex-1 flex-col gap-2 lg:max-w-lg">
        <div className="flex items-center justify-between gap-2">
          <span className="text-xl font-semibold">Positions</span>
        </div>
        <DialogAddTemplatePosition
          existingPositionIds={
            templatePositions?.map((p) => p.position.id) ?? []
          }
          templateId={templateId}
        />
        <div className="flex flex-col gap-4">
          {(templatePositions ?? [])
            .sort((a, b) =>
              a.position.display.localeCompare(b.position.display),
            )
            .map((templatePosition) => {
              const isDescriptionExpanded = expandedDescriptions.has(
                templatePosition.id,
              );

              return (
                <Card key={templatePosition.id}>
                  <CardHeader>
                    <CardTitle>{templatePosition.position.display}</CardTitle>
                    <CardDescription>
                      <PopoverTemplatePositionQuantity
                        templatePosition={templatePosition}
                      />
                    </CardDescription>
                    {templatePosition.position.description && (
                      <div className="flex gap-2">
                        <IconAlignLeft className="mt-1 size-3" />
                        <CardDescription className="flex-1 text-foreground">
                          <span
                            className={cn(
                              "inline",
                              isDescriptionExpanded
                                ? undefined
                                : "line-clamp-1",
                            )}
                          >
                            {templatePosition.position.description}
                          </span>
                          {"  "}
                          <button
                            className="inline cursor-pointer border-0 bg-transparent p-0 text-xs text-muted-foreground underline underline-offset-3"
                            onClick={() =>
                              setExpandedDescriptions((prev) => {
                                const next = new Set(prev);
                                if (next.has(templatePosition.id)) {
                                  next.delete(templatePosition.id);
                                } else {
                                  next.add(templatePosition.id);
                                }
                                return next;
                              })
                            }
                            type="button"
                          >
                            {isDescriptionExpanded ? "Show less" : "Show more"}
                          </button>
                        </CardDescription>
                      </div>
                    )}
                  </CardHeader>
                  <CardFooter className="gap-2">
                    <RemoveTemplatePositionButton
                      templatePosition={templatePosition}
                    />
                  </CardFooter>
                </Card>
              );
            })}
        </div>
      </div>
    </div>
  );
}

function DialogCreateEventFromTemplate({
  isPending,
  onCreateEvent,
}: {
  isPending: boolean;
  onCreateEvent: (date: string) => Promise<void>;
}) {
  const [open, setOpen] = useState(false);
  const form = useAppForm({
    defaultValues: {
      date: dayjs().format("YYYY-MM-DD"),
    },
    validators: {
      onSubmit: object({
        date: iso.date(),
      }),
    },
    onSubmit: async ({ value }) => {
      await onCreateEvent(value.date);
      setOpen(false);
    },
  });

  return (
    <Dialog
      open={open}
      onOpenChange={(nextOpen) => {
        setOpen(nextOpen);
        if (!nextOpen) form.reset();
      }}
    >
      <DialogTrigger
        render={
          <Button size="sm" variant="solid">
            <PlusIcon />
            Create event
          </Button>
        }
      />
      <DialogContent showCloseButton={false}>
        <DialogHeader>
          <DialogTitle>Create Event</DialogTitle>
          <DialogDescription>
            Create a new event from this template. Positions and quantities will
            be copied as shifts.
          </DialogDescription>
        </DialogHeader>
        <form
          onSubmit={(e) => {
            e.preventDefault();
            form.handleSubmit();
          }}
        >
          <form.AppField name="date">
            {(field) => (
              <field.DateField label="Date" placeholder="Select a date" />
            )}
          </form.AppField>
        </form>
        <DialogFooter>
          <DialogClose
            render={
              <Button disabled={isPending}>
                <XIcon />
                Cancel
              </Button>
            }
          />
          <Button
            disabled={isPending}
            variant="solid"
            onClick={() => form.handleSubmit()}
          >
            <CheckIcon />
            Create
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

function PopoverTemplatePositionQuantity({
  templatePosition,
}: {
  templatePosition: TemplatePosition;
}) {
  const [quantity, setQuantity] = useState<number>(templatePosition.quantity);
  const { mutate: updateTemplatePositionQuantity, isPending: isSaving } =
    useMutation(
      trpc.calendar.templates.updateTemplatePositionQuantity.mutationOptions({
        onSettled: async () => {
          await queryClient.invalidateQueries({
            queryKey:
              trpc.calendar.templates.getTemplatePositionsByTemplateId.queryKey(),
          });
        },
      }),
    );

  useEffect(() => {
    setQuantity(templatePosition.quantity);
  }, [templatePosition.quantity]);

  return (
    <Popover>
      <PopoverTrigger
        render={
          <Button size="xs">Quantity: {templatePosition.quantity}</Button>
        }
      />
      <PopoverContent>
        <PopoverHeader>
          <PopoverTitle>Modify quantity</PopoverTitle>
        </PopoverHeader>
        <div className="flex flex-col gap-4">
          <div className="flex items-center gap-1">
            <Button
              disabled={quantity <= 1}
              size="icon-xs"
              variant="ghost"
              onClick={() => setQuantity((v) => v - 1)}
            >
              <Minus className="size-3" />
            </Button>
            <Input
              className="w-12 [&_input]:text-center"
              inputMode="numeric"
              size="sm"
              type="text"
              value={quantity}
              onBeforeInput={(e) => {
                if (
                  e.nativeEvent.data &&
                  !/^[0-9]+$/.test(e.nativeEvent.data)
                ) {
                  e.preventDefault();
                }
              }}
              onBlur={(e) => Number(e.target.value) < 1 && setQuantity(1)}
              onChange={(e) => setQuantity(Number(e.target.value))}
            />
            <Button
              size="icon-xs"
              type="button"
              variant="ghost"
              onClick={() => setQuantity((v) => v + 1)}
            >
              <Plus className="size-3" />
            </Button>
          </div>
          <div className="flex items-center gap-1">
            <PopoverClose
              render={
                <Button
                  size="icon-sm"
                  variant="ghost"
                  onClick={() => setQuantity(templatePosition.quantity)}
                >
                  <X />
                </Button>
              }
            />
            <PopoverClose
              render={
                <Button
                  disabled={
                    isSaving ||
                    quantity < 1 ||
                    !Number.isInteger(quantity) ||
                    quantity === templatePosition.quantity
                  }
                  size="sm"
                  variant="solid"
                  onClick={() =>
                    updateTemplatePositionQuantity({
                      templatePositionId: templatePosition.id,
                      quantity,
                    })
                  }
                >
                  <Check />
                  Save
                </Button>
              }
            />
          </div>
        </div>
      </PopoverContent>
    </Popover>
  );
}

function RemoveTemplatePositionButton({
  templatePosition,
}: {
  templatePosition: TemplatePosition;
}) {
  const { mutate: deleteTemplatePosition, isPending } = useMutation(
    trpc.calendar.templates.deleteTemplatePosition.mutationOptions({
      onSettled: async () => {
        await queryClient.invalidateQueries({
          queryKey:
            trpc.calendar.templates.getTemplatePositionsByTemplateId.queryKey(),
        });
      },
    }),
  );

  return (
    <Tooltip>
      <TooltipTrigger
        render={
          <Button
            disabled={isPending}
            onClick={() =>
              deleteTemplatePosition({
                templatePositionId: templatePosition.id,
              })
            }
            type="button"
          >
            <IconTrash />
          </Button>
        }
      />
      <TooltipContent sideOffset={8}>Remove position</TooltipContent>
    </Tooltip>
  );
}

function DialogAddTemplatePosition({
  templateId,
  existingPositionIds,
}: {
  templateId: string;
  existingPositionIds: string[];
}) {
  const [tooltipOpen, setTooltipOpen] = useState(false);
  const { data: positions } = useQuery(
    trpc.calendar.positions.listAllPositions.queryOptions(),
  );
  const { mutate: addTemplatePositions, isPending } = useMutation(
    trpc.calendar.templates.createTemplatePositions.mutationOptions({
      onSettled: async () => {
        await queryClient.invalidateQueries({
          queryKey:
            trpc.calendar.templates.getTemplatePositionsByTemplateId.queryKey(),
        });
      },
    }),
  );

  const form = useAppForm({
    defaultValues: {
      templatePositionsToCreate: [] as Array<{
        position: Position;
        quantity: number;
      }>,
    },
    onSubmit: async ({ value }) => {
      addTemplatePositions({
        templateId,
        templatePositionsToCreate: value.templatePositionsToCreate.map(
          (entry) => ({
            positionId: entry.position.id,
            quantity: entry.quantity,
          }),
        ),
      });
    },
  });

  const selectedLength = useStore(
    form.store,
    (state) => state.values.templatePositionsToCreate.length,
  );

  return (
    <Dialog onOpenChange={(open) => !open && form.reset()}>
      <DialogTrigger
        render={
          <Button variant="ghost">
            <PlusIcon />
            Add position
          </Button>
        }
      />
      <DialogContent showCloseButton={false}>
        <DialogHeader>
          <DialogTitle>Add Positions</DialogTitle>
          <DialogDescription>
            Add position quantities that will become shifts when creating an
            event from this template.
          </DialogDescription>
        </DialogHeader>
        <div className="flex w-full flex-col gap-2">
          <form
            onSubmit={(e) => {
              e.preventDefault();
            }}
          >
            <form.Field mode="array" name="templatePositionsToCreate">
              {(templatePositionsField) => (
                <div className="flex flex-col gap-2">
                  {templatePositionsField.state.value.map((entry, i) => (
                    <div
                      key={entry.position.id}
                      className="flex items-center gap-2"
                    >
                      <form.Field
                        name={`templatePositionsToCreate[${i}].position`}
                      >
                        {(positionField) => (
                          <div className="min-w-40 flex-1">
                            {positionField.state.value.display}
                          </div>
                        )}
                      </form.Field>
                      <form.Field
                        name={`templatePositionsToCreate[${i}].quantity`}
                      >
                        {(quantityField) => (
                          <div className="flex items-center gap-1">
                            <Button
                              disabled={quantityField.state.value <= 1}
                              size="icon-xs"
                              type="button"
                              variant="ghost"
                              onClick={() =>
                                quantityField.handleChange((v) => v - 1)
                              }
                            >
                              <Minus className="size-3" />
                            </Button>
                            <Input
                              className="w-12 [&_input]:text-center"
                              inputMode="numeric"
                              size="sm"
                              type="text"
                              value={quantityField.state.value}
                              onBeforeInput={(e) => {
                                if (
                                  e.nativeEvent.data &&
                                  !/^[0-9]+$/.test(e.nativeEvent.data)
                                ) {
                                  e.preventDefault();
                                }
                              }}
                              onBlur={(e) =>
                                Number(e.target.value) < 1 &&
                                quantityField.handleChange(1)
                              }
                              onChange={(e) =>
                                quantityField.handleChange(
                                  Number(e.target.value),
                                )
                              }
                            />
                            <Button
                              size="icon-xs"
                              type="button"
                              variant="ghost"
                              onClick={() =>
                                quantityField.handleChange((v) => v + 1)
                              }
                            >
                              <Plus className="size-3" />
                            </Button>
                          </div>
                        )}
                      </form.Field>
                      <Button
                        size="icon-sm"
                        type="button"
                        variant="ghost"
                        onClick={() => templatePositionsField.removeValue(i)}
                      >
                        <X />
                      </Button>
                    </div>
                  ))}
                  <Combobox
                    items={positions?.filter(
                      (position) =>
                        !existingPositionIds.includes(position.id) &&
                        !form.state.values.templatePositionsToCreate.some(
                          (entry) => entry.position.id === position.id,
                        ),
                    )}
                    itemToStringLabel={(position: Position) => position.display}
                    onValueChange={(value) =>
                      value &&
                      templatePositionsField.pushValue({
                        position: value,
                        quantity: 1,
                      })
                    }
                  >
                    <ComboboxInput placeholder="Search positions..." />
                    <ComboboxContent>
                      <ComboboxEmpty>No positions found.</ComboboxEmpty>
                      <ComboboxList>
                        {(position: Position) => (
                          <ComboboxItem key={position.id} value={position}>
                            <div className="flex flex-1 items-center justify-between">
                              <span>{position.display}</span>
                              <span className="text-xs text-gray-500">
                                {position.name}
                              </span>
                            </div>
                          </ComboboxItem>
                        )}
                      </ComboboxList>
                    </ComboboxContent>
                  </Combobox>
                </div>
              )}
            </form.Field>
          </form>
        </div>
        <DialogFooter>
          <DialogClose
            render={
              <Button>
                <XIcon />
                Cancel
              </Button>
            }
          />
          <Tooltip
            open={tooltipOpen && selectedLength === 0}
            onOpenChange={setTooltipOpen}
          >
            <TooltipTrigger
              render={
                <div className="has-[:disabled]:cursor-not-allowed">
                  <Button
                    disabled={isPending || selectedLength === 0}
                    variant="solid"
                    onClick={() => {
                      if (selectedLength === 0) return;
                      form.handleSubmit();
                    }}
                  >
                    <CheckIcon />
                    Save
                  </Button>
                </div>
              }
            />
            <TooltipContent>Select positions to add</TooltipContent>
          </Tooltip>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
