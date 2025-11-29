import { useAppForm } from "@/components/form";
import { ContactFieldGroup } from "@/components/form/field-groups";
import { NameFieldGroup } from "@/components/form/field-groups/name-field-group";
import {
  Button,
  Field,
  FieldGroup,
  FieldLabel,
  FieldLegend,
  FieldSet,
  Input,
} from "@/components/ui";
import { authClient } from "@/lib/auth-client";
import { trpc } from "@/lib/trpc";
import { useQuery } from "@tanstack/react-query";
import { createFileRoute } from "@tanstack/react-router";
import { BadgeCheck } from "lucide-react";
import { Fragment } from "react/jsx-runtime";

export const Route = createFileRoute("/_app/admin/users/$userId/profile")({
  component: RouteComponent,
  loader: async () => {
    const { data } = await authClient.listAccounts();
    return data;
  },
});

function RouteComponent() {
  // Route params & loader data
  const userId = Number(Route.useParams().userId);
  const accounts = Route.useLoaderData();

  // Queries
  const { data: user } = useQuery(
    trpc.users.getUserById.queryOptions({ userId }),
  );
  const { data: betterAuth } = useQuery(
    trpc.users.getBetterAuthUserById.queryOptions(
      { betterAuthId: user?.betterAuthId ?? "" },
      { enabled: !!user },
    ),
  );
  const { data: attributes } = useQuery(
    trpc.users.getAttributesByUserId.queryOptions({ userId }),
  );

  // Hooks
  const form = useAppForm({
    defaultValues: {
      nameFirst: user?.nameFirst ?? "",
      nameMiddle: user?.nameMiddle ?? "",
      nameLast: user?.nameLast ?? "",
      email: betterAuth?.email ?? "",
      phoneNumber: betterAuth?.phoneNumber ?? "",
      betterAuthId: user?.betterAuthId ?? "",
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
              {betterAuth?.email ? (
                betterAuth?.emailVerified ? (
                  <>
                    <div className="flex items-center gap-1">
                      <BadgeCheck className="size-6 fill-green-600 stroke-white" />
                      <span>{betterAuth?.email}</span>
                    </div>
                    <Button size="sm" variant="link">
                      {/* TODO: Modal to change email */}
                      Change email
                    </Button>
                  </>
                ) : (
                  <>
                    <span>{betterAuth?.email}</span>
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
              {betterAuth?.phoneNumber ? (
                betterAuth?.phoneNumberVerified ? (
                  <>
                    <div className="flex items-center gap-1">
                      <BadgeCheck className="size-6 fill-green-600 stroke-white" />
                      <span>{betterAuth?.phoneNumber}</span>
                    </div>
                    <Button size="sm" variant="link">
                      {/* TODO: Modal to change phone number */}
                      Change phone
                    </Button>
                  </>
                ) : (
                  <>
                    <span>{betterAuth?.phoneNumber}</span>
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
          <FieldLabel>BetterAuth ID</FieldLabel>
          <div className="flex flex-1 items-center justify-between gap-2 px-2">
            {user.betterAuthId ? (
              <>
                <div className="flex items-center gap-1">
                  <BadgeCheck className="size-6 fill-green-600 stroke-white" />
                  <span>{user.betterAuthId}</span>
                </div>
                <Button size="sm" variant="link">
                  {/* TODO: Add options for user who is registered in BetterAuth */}
                  Options
                </Button>
              </>
            ) : (
              <>
                <span className="text-slate-500">
                  User not registered in BetterAuth
                </span>
                <Button size="sm" variant="link">
                  {/* TODO: Add options for user who is not registered in BetterAuth */}
                  Options
                </Button>
              </>
            )}
          </div>
        </Field>
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
        <Field className="px-2">
          <FieldLabel>Attributes</FieldLabel>
          <div className="px-2">
            {attributes && attributes.length > 0 ? (
              <div className="grid grid-cols-2 gap-y-2">
                {attributes.map((a) => (
                  <Fragment key={a.keyName}>
                    <span className="border-t pt-0.5">{a.keyDisplay}</span>
                    <div className="flex flex-col border-t pt-0.5">
                      {a.values.map((v) => (
                        <span key={v.valueName}>{v.valueDisplay}</span>
                      ))}
                    </div>
                  </Fragment>
                ))}
              </div>
            ) : (
              <div className="flex items-center justify-between gap-2">
                <span className="text-slate-500">
                  No attributes have been added
                </span>
                <Button size="sm" variant="link">
                  {/* TODO: ?Modal for adding attributes */}
                  Add attributes
                </Button>
              </div>
            )}
          </div>
        </Field>
      </FieldSet>
    </form>
  );
}
