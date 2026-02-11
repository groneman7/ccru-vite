import { Link } from "@tanstack/react-router";
import {
  flexRender,
  getCoreRowModel,
  getSortedRowModel,
  useReactTable,
  type ColumnDef,
  type SortingState,
} from "@tanstack/react-table";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "~/client/components/ui";
import { cn } from "~/client/utils";
import type { UserSchemaForTable } from "~/server/db/types";
import { ArrowDown, ArrowUp } from "lucide-react";
import { useMemo, useState } from "react";

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
    size: 50,
  },
  {
    accessorKey: "nameFirst",
    header: "First Name",
    cell: ({ row, getValue }) => (
      <Link to="/admin/users/$userId" params={{ userId: row.id }}>
        {getValue<string>()}
      </Link>
    ),
    // size: 100,
  },
  {
    accessorKey: "nameMiddle",
    enableSorting: false,
    header: "Middle Name",
  },
  {
    accessorKey: "nameLast",
    header: "Last Name",
  },
  {
    accessorKey: "ACCOUNT TYPE",
    header: "Account Type",
  },
  {
    accessorKey: "USER ROLE",
    header: "User Role",
  },
];

interface UsersTableProps {
  users: UserSchemaForTable[];
}

export function UsersTable({ users }: UsersTableProps) {
  const [sorting, setSorting] = useState<SortingState>([
    { id: "nameLast", desc: false },
  ]);

  const table = useReactTable({
    columns: COLUMNS,
    data: users,
    defaultColumn: {
      minSize: 50,
      maxSize: 800,
    },
    state: {
      sorting,
    },
    getCoreRowModel: getCoreRowModel(),
    getRowId: (row) => row.id.toString(),
    getSortedRowModel: getSortedRowModel(),
    onSortingChange: setSorting,
  });

  const columnSizeVars = useMemo(() => {
    const headers = table.getFlatHeaders();
    const colSizes: { [key: string]: number } = {};
    for (let i = 0; i < headers.length; i++) {
      const header = headers[i]!;
      colSizes[`--header-${header.id}-size`] = header.getSize();
      colSizes[`--col-${header.column.id}-size`] = header.column.getSize();
    }
    return colSizes;
  }, [table.getState().columnSizingInfo, table.getState().columnSizing]);

  return (
    <div>
      <Table style={{ ...columnSizeVars, width: table.getTotalSize() }}>
        <TableHeader>
          {table.getHeaderGroups().map((headerGroup) => (
            <TableRow key={headerGroup.id}>
              {headerGroup.headers.map((header) => {
                return (
                  <TableHead
                    key={header.id}
                    style={{
                      width: `calc(var(--header-${header?.id}-size) * 1px)`,
                    }}
                  >
                    {header.isPlaceholder ? null : (
                      <div
                        className={cn(
                          "select-none",
                          header.column.getCanSort() ? "cursor-pointer" : "",
                        )}
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
                      width: `calc(var(--col-${cell.column.id}-size) * 1px)`,
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
