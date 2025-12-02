import { WorkspaceContent, WorkspaceHeader } from "~client/components";
import {
  Combobox,
  DatePicker,
  Input,
  InputGroup,
  InputGroupButton,
  InputGroupCombobox,
  InputGroupInput,
  Textarea,
} from "~client/components/ui";
import { createFileRoute } from "@tanstack/react-router";
import { Clock } from "lucide-react";

const OPTIONS = [
  { label: "Option 1", id: "1" },
  { label: "Option 2", id: "2" },
  { label: "Option 3", id: "3" },
  { label: "Option 4", id: "4" },
  { label: "Option 5", id: "5" },
];

export const Route = createFileRoute("/_app/ui/inputs")({
  component: RouteComponent,
});

function RouteComponent() {
  return (
    <>
      <WorkspaceHeader>Inputs</WorkspaceHeader>
      <WorkspaceContent>
        <div className="flex flex-col gap-4">
          <Combobox
            suffix={<Clock />}
            options={OPTIONS}
            placeholder="Choose an option..."
          />
          <Combobox
            suffix={<Clock />}
            options={OPTIONS}
            placeholder="Choose an option..."
            variant="underlined"
          />
          <DatePicker placeholder="Choose a date..." />
          <Input placeholder="Input placeholder" />
          <InputGroup>
            <InputGroupCombobox
              options={OPTIONS}
              placeholder="Input group item 1"
            />
            <InputGroupInput placeholder="Input group item 2" />
            <InputGroupCombobox
              options={OPTIONS}
              placeholder="Input group item 3"
            />
            <InputGroupButton>Button</InputGroupButton>
          </InputGroup>
          <Textarea placeholder="Textarea placeholder" />
        </div>
      </WorkspaceContent>
    </>
  );
}
