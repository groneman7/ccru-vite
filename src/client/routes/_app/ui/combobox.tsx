import { createFileRoute } from "@tanstack/react-router";
import { Workspace, WorkspaceContent } from "~client/components";
import {
  Combobox,
  ComboboxContent,
  ComboboxEmpty,
  ComboboxInput,
  ComboboxItem,
  ComboboxList,
} from "~client/components/ui";

const OPTIONS = [
  { id: "orange", name: "Orange", type: "fruit" },
  { id: "grape", name: "Grape", type: "fruit" },
  { id: "strawberry", name: "Strawberry", type: "fruit" },
  { id: "banana", name: "Banana", type: "fruit" },
  { id: "pineapple", name: "Pineapple", type: "fruit" },
  { id: "apple", name: "Apple", type: "fruit" },
  { id: "mango", name: "Mango", type: "fruit" },
  { id: "kiwi", name: "Kiwi", type: "fruit" },
  { id: "watermelon", name: "Watermelon", type: "fruit" },
  { id: "lemon", name: "Lemon", type: "fruit" },
  { id: "lime", name: "Lime", type: "fruit" },
  { id: "coconut", name: "Coconut", type: "fruit" },
  { id: "papaya", name: "Papaya", type: "fruit" },
  { id: "cherry", name: "Cherry", type: "fruit" },
  { id: "broccoli", name: "Broccoli", type: "vegetable" },
  { id: "carrot", name: "Carrot", type: "vegetable" },
  { id: "cucumber", name: "Cucumber", type: "vegetable" },
  { id: "lettuce", name: "Lettuce", type: "vegetable" },
  { id: "onion", name: "Onion", type: "vegetable" },
  { id: "potato", name: "Potato", type: "vegetable" },
];

export const Route = createFileRoute("/_app/ui/combobox")({
  component: RouteComponent,
});
function RouteComponent() {
  return (
    <Workspace>
      <WorkspaceContent>
        <div className="flex flex-col gap-4">
          <div className="flex flex-1 gap-1">
            <Combobox
              items={OPTIONS}
              itemToStringLabel={(item: (typeof OPTIONS)[number]) => item.name}
              itemToStringValue={(item: (typeof OPTIONS)[number]) => item.id}
            >
              <ComboboxInput placeholder="Select an item..." />
              <ComboboxContent>
                <ComboboxEmpty>No items found.</ComboboxEmpty>
                <ComboboxList>
                  {(item) => (
                    <ComboboxItem key={item.id} value={item}>
                      {item.name}
                    </ComboboxItem>
                  )}
                </ComboboxList>
              </ComboboxContent>
            </Combobox>
          </div>
        </div>
      </WorkspaceContent>
    </Workspace>
  );
}
