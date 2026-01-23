import { useQuery } from "@tanstack/react-query";
import { createFileRoute } from "@tanstack/react-router";
import {
  flexRender,
  getCoreRowModel,
  useReactTable,
  type ColumnDef,
  type RowModel,
} from "@tanstack/react-table";
import { WorkspaceContent, WorkspaceHeader } from "~client/components";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "~client/components/ui";
import { trpc } from "~client/lib/trpc";
import type { Template } from "~shared/types";

export const Route = createFileRoute("/_app/calendar/templates/")({
  component: RouteComponent,
});

const COLUMNS: ColumnDef<Template>[] = [
  {
    accessorKey: "name",
    header: "Name",
    // cell: ({ row }) => <div className="w-24">{row.getValue("name")}</div>,
  },
  {
    accessorKey: "display",
    header: "Display",
  },
  {
    accessorKey: "location",
    header: "Location",
  },
  {
    accessorKey: "description",
    header: "Description",
    // size: 200,
    cell: ({ row }) => (
      <div className="overflow-hidden text-ellipsis whitespace-nowrap">
        {row.getValue("description")}
      </div>
    ),
  },
];

function RouteComponent() {
  // Queries
  const { data: templates, isLoading: templatesLoading } = useQuery(
    trpc.calendar.templates.listAllTemplates.queryOptions(),
  );

  const table = useReactTable({
    data: templates ?? [],
    columns: COLUMNS,
    getCoreRowModel: getCoreRowModel(),
  });

  if (templatesLoading) return <div>Loading templates...</div>;

  return (
    <>
      <WorkspaceHeader>Event Templates</WorkspaceHeader>
      <WorkspaceContent>
        <Table>
          <TableHeader>
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id}>
                {headerGroup.headers.map((header) => (
                  <TableHead key={header.id}>
                    {header.isPlaceholder
                      ? null
                      : flexRender(
                          header.column.columnDef.header,
                          header.getContext(),
                        )}
                  </TableHead>
                ))}
              </TableRow>
            ))}
          </TableHeader>
          <TableBody>
            {table.getRowModel().rows?.length ? (
              table.getRowModel().rows.map((row) => (
                <TableRow
                  key={row.id}
                  data-state={row.getIsSelected() && "selected"}
                >
                  {row.getVisibleCells().map((cell) => (
                    <TableCell key={cell.id}>
                      {flexRender(
                        cell.column.columnDef.cell,
                        cell.getContext(),
                      )}
                    </TableCell>
                  ))}
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell
                  // colSpan={COLUMNS.length}
                  className="h-24 text-center"
                >
                  No templates found.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </WorkspaceContent>
    </>
  );
}
