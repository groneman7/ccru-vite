import { createFileRoute } from "@tanstack/react-router";
import { Workspace, WorkspaceContent } from "~client/components";
import { Button } from "~client/components/ui/button";
import {
  CheckIcon,
  LinkIcon,
  SettingsIcon,
  Trash2Icon,
  XIcon,
} from "lucide-react";

export const Route = createFileRoute("/_app/ui/buttons")({
  component: RouteComponent,
});

function RouteComponent() {
  return (
    <Workspace>
      <WorkspaceContent>
        <div className="flex flex-col gap-4">
          <div className="flex flex-1 gap-1">
            <Button size="xs" variant="solid">
              <CheckIcon />
              Solid
            </Button>
            <Button size="xs" variant="outline">
              <SettingsIcon />
              Outline
            </Button>
            <Button size="xs" variant="secondary">
              <CheckIcon />
              Secondary
            </Button>
            <Button size="xs" variant="ghost">
              <XIcon />
              Ghost
            </Button>
            <Button size="xs" variant="destructive">
              <Trash2Icon />
              Destructive
            </Button>
            <Button size="xs" variant="link">
              <LinkIcon />
              Link
            </Button>
          </div>
          <div className="flex flex-1 gap-1">
            <Button size="sm" variant="solid">
              <CheckIcon />
              Solid
            </Button>
            <Button size="sm" variant="outline">
              <SettingsIcon />
              Outline
            </Button>
            <Button size="sm" variant="secondary">
              <CheckIcon />
              Secondary
            </Button>
            <Button size="sm" variant="ghost">
              <XIcon />
              Ghost
            </Button>
            <Button size="sm" variant="destructive">
              <Trash2Icon />
              Destructive
            </Button>
            <Button size="sm" variant="link">
              <LinkIcon />
              Link
            </Button>
          </div>
          <div className="flex flex-1 gap-1">
            <Button variant="solid">
              <CheckIcon />
              Solid
            </Button>
            <Button variant="outline">
              <SettingsIcon />
              Outline
            </Button>
            <Button variant="secondary">
              <CheckIcon />
              Secondary
            </Button>
            <Button variant="ghost">
              <XIcon />
              Ghost
            </Button>
            <Button variant="destructive">
              <Trash2Icon />
              Destructive
            </Button>
            <Button variant="link">
              <LinkIcon />
              Link
            </Button>
          </div>
          <div className="flex flex-1 gap-1">
            <Button size="lg" variant="solid">
              <CheckIcon />
              Solid
            </Button>
            <Button size="lg" variant="outline">
              <SettingsIcon />
              Outline
            </Button>
            <Button size="lg" variant="secondary">
              <CheckIcon />
              Secondary
            </Button>
            <Button size="lg" variant="ghost">
              <XIcon />
              Ghost
            </Button>
            <Button size="lg" variant="destructive">
              <Trash2Icon />
              Destructive
            </Button>
            <Button size="lg" variant="link">
              <LinkIcon />
              Link
            </Button>
          </div>
          <div className="flex flex-1 gap-1">
            <Button size="icon-xs" variant="solid">
              <CheckIcon />
            </Button>
            <Button size="icon-xs" variant="outline">
              <SettingsIcon />
            </Button>
            <Button size="icon-xs" variant="secondary">
              <CheckIcon />
            </Button>
            <Button size="icon-xs" variant="ghost">
              <XIcon />
            </Button>
            <Button size="icon-xs" variant="destructive">
              <Trash2Icon />
            </Button>
            <Button size="icon-xs" variant="link">
              <LinkIcon />
            </Button>
          </div>
          <div className="flex flex-1 gap-1">
            <Button size="icon-sm" variant="solid">
              <CheckIcon />
            </Button>
            <Button size="icon-sm" variant="outline">
              <SettingsIcon />
            </Button>
            <Button size="icon-sm" variant="secondary">
              <CheckIcon />
            </Button>
            <Button size="icon-sm" variant="ghost">
              <XIcon />
            </Button>
            <Button size="icon-sm" variant="destructive">
              <Trash2Icon />
            </Button>
            <Button size="icon-sm" variant="link">
              <LinkIcon />
            </Button>
          </div>
          <div className="flex flex-1 gap-1">
            <Button size="icon" variant="solid">
              <CheckIcon />
            </Button>
            <Button size="icon" variant="outline">
              <SettingsIcon />
            </Button>
            <Button size="icon" variant="secondary">
              <CheckIcon />
            </Button>
            <Button size="icon" variant="ghost">
              <XIcon />
            </Button>
            <Button size="icon" variant="destructive">
              <Trash2Icon />
            </Button>
            <Button size="icon" variant="link">
              <LinkIcon />
            </Button>
          </div>
          <div className="flex flex-1 gap-1">
            <Button size="icon-lg" variant="solid">
              <CheckIcon />
            </Button>
            <Button size="icon-lg" variant="outline">
              <SettingsIcon />
            </Button>
            <Button size="icon-lg" variant="secondary">
              <CheckIcon />
            </Button>
            <Button size="icon-lg" variant="ghost">
              <XIcon />
            </Button>
            <Button size="icon-lg" variant="destructive">
              <Trash2Icon />
            </Button>
            <Button size="icon-lg" variant="link">
              <LinkIcon />
            </Button>
          </div>
        </div>
      </WorkspaceContent>
    </Workspace>
  );
}
