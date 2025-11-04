import { Workspace, WorkspaceContent } from "@/src/components";
import { Button, ButtonGroup, Input } from "@/src/components/ui";
import { createFileRoute } from "@tanstack/react-router";
import { Link, Search } from "lucide-react";

export const Route = createFileRoute("/ui/buttons")({
  component: RouteComponent,
});

function RouteComponent() {
  return (
    <Workspace>
      <WorkspaceContent>
        <div className="flex flex-col gap-4">
          <div className="flex flex-1 gap-1">
            <Button
              size="sm"
              variant="solid">
              Solid
            </Button>
            <Button
              size="sm"
              variant="outline">
              Outline
            </Button>
            <Button
              size="sm"
              variant="filled">
              Filled
            </Button>
            <Button
              size="sm"
              variant="text">
              Text
            </Button>
            <Button
              size="sm"
              variant="link">
              Link
            </Button>
          </div>
          <div className="flex flex-1 gap-1">
            <Button>Solid</Button>
            <Button variant="outline">Outline</Button>
            <Button variant="filled">Filled</Button>
            <Button variant="text">Text</Button>
            <Button variant="link">Link</Button>
          </div>
          <div className="flex flex-1 gap-1">
            <Button
              size="lg"
              variant="solid">
              Solid
            </Button>
            <Button
              size="lg"
              variant="outline">
              Outline
            </Button>
            <Button
              size="lg"
              variant="filled">
              Filled
            </Button>
            <Button
              size="lg"
              variant="text">
              Text
            </Button>
            <Button
              size="lg"
              variant="link">
              Link
            </Button>
          </div>
          <div className="flex flex-1 gap-1">
            <Button
              round
              size="icon"
              variant="solid">
              <Link />
            </Button>
            <Button
              round
              size="icon"
              variant="outline">
              <Link />
            </Button>
            <Button
              round
              size="icon"
              variant="filled">
              <Link />
            </Button>
            <Button
              round
              size="icon"
              variant="text">
              <Link />
            </Button>
          </div>
          <div className="flex flex-1 gap-1">
            <Button fill>Fill</Button>
          </div>
          <div className="flex flex-1 gap-1">
            <ButtonGroup>
              <Button>Button 1</Button>
              <Button>Button 2</Button>
              <Button>Button 3</Button>
            </ButtonGroup>
            <ButtonGroup>
              <Input />
              <Button size="icon">
                <Search />
              </Button>
            </ButtonGroup>
          </div>
        </div>
      </WorkspaceContent>
    </Workspace>
  );
}
