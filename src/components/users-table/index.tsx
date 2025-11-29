import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui";
import type { UserSchema, UserSchemaForTable } from "@/db/types";
import { cn } from "@/utils";
import { Link } from "@tanstack/react-router";
import {
  flexRender,
  getCoreRowModel,
  getSortedRowModel,
  useReactTable,
  type ColumnDef,
  type SortingState,
} from "@tanstack/react-table";
import { ArrowDown, ArrowUp } from "lucide-react";
import { useState } from "react";

// TODO: Column widths still not working right
const COLUMNS: ColumnDef<UserSchemaForTable>[] = [
  // {
  //   accessorKey: "betterAuthId",
  //   enableSorting: false,
  //   header: "Better Auth Id",
  //   size: 1,
  // },
  {
    accessorKey: "id",
    header: "User ID",
    size: 1,
  },
  {
    accessorKey: "nameFirst",
    header: "First Name",
    cell: ({ row, getValue }) => (
      <Link to="/admin/users/$userId" params={{ userId: row.id }}>
        {getValue<string>()}
      </Link>
    ),
    size: 1,
  },
  {
    accessorKey: "nameMiddle",
    enableSorting: false,
    header: "Middle Name",
    size: 1,
  },
  {
    accessorKey: "nameLast",
    header: "Last Name",
    size: 1,
  },
  {
    accessorKey: "ACCOUNT TYPE",
    header: "Account Type",
    size: 1,
  },
  {
    accessorKey: "USER ROLE",
    header: "User Role",
    size: 1,
  },
];

interface UsersTableProps {
  users: UserSchemaForTable[];
}

export function UsersTable({
  // columns,
  users,
}: UsersTableProps) {
  const [sorting, setSorting] = useState<SortingState>([
    { id: "nameLast", desc: false },
  ]);

  const table = useReactTable({
    columns: COLUMNS,
    data: users,
    state: {
      sorting,
    },
    getCoreRowModel: getCoreRowModel(),
    getRowId: (row) => row.id.toString(),
    getSortedRowModel: getSortedRowModel(),
    onSortingChange: setSorting,
  });

  const totalColumnSize = table.getTotalSize();

  return (
    <div>
      <Table className="table-fixed">
        <TableHeader>
          {table.getHeaderGroups().map((headerGroup) => (
            <TableRow key={headerGroup.id}>
              {headerGroup.headers.map((header) => {
                return (
                  <TableHead
                    key={header.id}
                    style={{
                      width: `${(header.getSize() / totalColumnSize) * 100}%`,
                    }}
                  >
                    {header.isPlaceholder ? null : (
                      <div
                        className={cn(
                          "select-none",
                          header.column.getCanSort() ? "cursor-pointer" : "",
                        )}
                        title={"test"}
                        onClick={header.column.getToggleSortingHandler()}
                      >
                        <div className="flex items-center gap-1">
                          {flexRender(
                            header.column.columnDef.header,
                            header.getContext(),
                          )}
                          {{
                            asc: <ArrowUp className="size-4" />,
                            desc: <ArrowDown className="size-4" />,
                          }[header.column.getIsSorted() as string] ?? null}
                        </div>
                      </div>
                    )}
                  </TableHead>
                );
              })}
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
                  <TableCell
                    key={cell.id}
                    style={{
                      width: `${(cell.column.getSize() / totalColumnSize) * 100}%`,
                    }}
                  >
                    {flexRender(cell.column.columnDef.cell, cell.getContext())}
                  </TableCell>
                ))}
              </TableRow>
            ))
          ) : (
            <TableRow>
              <TableCell colSpan={COLUMNS.length} className="h-24 text-center">
                No results.
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
    </div>
  );
}
