import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

interface DataTableProps {
  columns: string[];
  rows: unknown[][];
  sqlQuery?: string;
}

export function DataTable({ columns, rows, sqlQuery }: DataTableProps) {
  return (
    <div className="my-3 rounded-lg border overflow-hidden">
      <div className="overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow>
              {columns.map((col) => (
                <TableHead key={col} className="text-xs font-semibold">
                  {col}
                </TableHead>
              ))}
            </TableRow>
          </TableHeader>
          <TableBody>
            {rows.slice(0, 50).map((row, i) => (
              <TableRow key={i}>
                {row.map((cell, j) => (
                  <TableCell key={j} className="text-xs py-1.5">
                    {String(cell ?? "")}
                  </TableCell>
                ))}
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
      {sqlQuery && (
        <details className="border-t px-3 py-2">
          <summary className="text-xs text-muted-foreground cursor-pointer">
            View SQL Query
          </summary>
          <pre className="mt-1 text-xs bg-muted p-2 rounded overflow-x-auto">
            {sqlQuery}
          </pre>
        </details>
      )}
      {rows.length > 50 && (
        <p className="text-xs text-muted-foreground px-3 py-1 border-t">
          Showing 50 of {rows.length} rows
        </p>
      )}
    </div>
  );
}
