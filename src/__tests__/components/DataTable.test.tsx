import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { DataTable } from "@/components/chat/DataTable";

const columns = ["city", "temp", "humidity"];
const rows = [
  ["Dallas", "95", "60"],
  ["Austin", "92", "65"],
];

describe("DataTable", () => {
  it("renders column headers", () => {
    render(<DataTable columns={columns} rows={rows} />);
    expect(screen.getByText("city")).toBeInTheDocument();
    expect(screen.getByText("temp")).toBeInTheDocument();
    expect(screen.getByText("humidity")).toBeInTheDocument();
  });

  it("renders all rows when count <= 50", () => {
    render(<DataTable columns={columns} rows={rows} />);
    expect(screen.getByText("Dallas")).toBeInTheDocument();
    expect(screen.getByText("Austin")).toBeInTheDocument();
  });

  it("caps display at 50 rows and shows a count notice", () => {
    const bigRows = Array.from({ length: 60 }, (_, i) => [`City${i}`, `${70 + i}`, `${50}`]);
    render(<DataTable columns={columns} rows={bigRows} />);
    expect(screen.getByText(/Showing 50 of 60 rows/)).toBeInTheDocument();
    expect(screen.queryByText("City50")).not.toBeInTheDocument();
  });

  it("does not show row-count notice when rows <= 50", () => {
    render(<DataTable columns={columns} rows={rows} />);
    expect(screen.queryByText(/Showing/)).not.toBeInTheDocument();
  });

  it("renders the SQL query section when sqlQuery is provided", () => {
    render(<DataTable columns={columns} rows={rows} sqlQuery="SELECT * FROM weather" />);
    expect(screen.getByText("View SQL Query")).toBeInTheDocument();
    expect(screen.getByText("SELECT * FROM weather")).toBeInTheDocument();
  });

  it("does not render the SQL section when sqlQuery is absent", () => {
    render(<DataTable columns={columns} rows={rows} />);
    expect(screen.queryByText("View SQL Query")).not.toBeInTheDocument();
  });

  it("renders null cell values as empty string", () => {
    render(<DataTable columns={["city"]} rows={[[null]]} />);
    // Should not throw and null becomes ""
    const cells = screen.getAllByRole("cell");
    expect(cells[0].textContent).toBe("");
  });

  it("renders an empty table gracefully when rows array is empty", () => {
    render(<DataTable columns={columns} rows={[]} />);
    expect(screen.getByText("city")).toBeInTheDocument();
    expect(screen.queryByText("Dallas")).not.toBeInTheDocument();
  });
});
