import { useQuery } from "@tanstack/react-query";
import { createFileRoute } from "@tanstack/react-router";
import { useAppForm } from "~/client/components/form";
import { NameFieldGroup } from "~/client/components/form/field-groups/name-field-group";
import {
  Button,
  Field,
  FieldGroup,
  FieldLabel,
  FieldLegend,
  FieldSet,
} from "~/client/components/ui";
import { authClient } from "~/client/lib/auth-client";
import { trpc } from "~/client/lib/router";
import { BadgeCheck } from "lucide-react";

export const Route = createFileRoute("/_app/admin/users/$userId/profile")({
  component: RouteComponent,
  loader: async () => {
    const { data } = await authClient.listAccounts();
    return data;
  },
});

function RouteComponent() {
  // Route params & loader data
  const userId = Route.useParams().userId;
  const accounts = Route.useLoaderData();

  // Queries
  const { data: user } = useQuery(
    trpc.users.getUserById.queryOptions({ userId }),
  );

  // Hooks
  const form = useAppForm({
    defaultValues: {
      nameFirst: user?.nameFirst ?? "",
      nameMiddle: user?.nameMiddle ?? "",
      nameLast: user?.nameLast ?? "",
      email: user?.email ?? "",
      phoneNumber: user?.phoneNumber ?? "",
    },
  });

  // Render
  if (!user) return null;

  return (
    <form
      className="flex flex-col gap-6"
      onSubmit={(e) => {
        e.preventDefault();
        form.handleSubmit();
      }}
    >
      <NameFieldGroup
        form={form}
        fields={{
          nameFirst: "nameFirst",
          nameMiddle: "nameMiddle",
          nameLast: "nameLast",
        }}
      />
      <FieldSet>
        <FieldLegend>Contact</FieldLegend>
        <FieldGroup className="px-2">
          <Field>
            <FieldLabel>Email</FieldLabel>
            <div className="flex items-center justify-between gap-1 px-2">
              {user?.email ? (
                user?.emailVerified ? (
                  <>
                    <div className="flex items-center gap-1">
                      <BadgeCheck className="size-6 fill-green-600 stroke-white" />
                      <span>{user?.email}</span>
                    </div>
                    <Button size="sm" variant="link">
                      {/* TODO: Modal to change email */}
                      Change email
                    </Button>
                  </>
                ) : (
                  <>
                    <span>{user?.email}</span>
                    <Button size="sm" variant="link">
                      {/* TODO: Modal to verify email */}
                      Send verification
                    </Button>
                  </>
                )
              ) : (
                <Button size="sm" variant="link">
                  {/* TODO: Modal to add email */}
                  Add email
                </Button>
              )}
            </div>
          </Field>
          <Field>
            <FieldLabel>Phone</FieldLabel>
            <div className="flex items-center justify-between gap-1 px-2">
              {user?.phoneNumber ? (
                user?.phoneNumberVerified ? (
                  <>
                    <div className="flex items-center gap-1">
                      <BadgeCheck className="size-6 fill-green-600 stroke-white" />
                      <span>{user?.phoneNumber}</span>
                    </div>
                    <Button size="sm" variant="link">
                      {/* TODO: Modal to change phone number */}
                      Change phone
                    </Button>
                  </>
                ) : (
                  <>
                    <span>{user?.phoneNumber}</span>
                    <Button size="sm" variant="link">
                      {/* TODO: Modal to verify phone number */}
                      Send verification
                    </Button>
                  </>
                )
              ) : (
                <Button size="sm" variant="link">
                  {/* TODO: Modal to add phone number */}
                  Add phone
                </Button>
              )}
            </div>
          </Field>
        </FieldGroup>
      </FieldSet>
      <FieldSet>
        <FieldLegend>Account</FieldLegend>
        <Field className="px-2">
          <FieldLabel>Connected Accounts</FieldLabel>
          <div className="flex flex-col gap-1 px-2">
            {accounts?.map((a) => (
              <div
                key={a.id}
                className="flex items-center justify-between gap-2"
              >
                {/* TODO: Add icon for account provider */}
                <span>{a.providerId}</span>
                <Button size="sm" variant="link">
                  {/* TODO: Modal to disconnect account */}
                  Disconnect
                </Button>
              </div>
            ))}
          </div>
        </Field>
      </FieldSet>
    </form>
  );
}
