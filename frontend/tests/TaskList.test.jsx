import { describe, test, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import TaskList from "../src/components/TaskList";

describe("TaskList", () => {
  test("shows an empty state message when there are no tasks", () => {
    render(<TaskList tasks={[]} onToggle={() => {}} onDelete={() => {}} />);
    expect(screen.getByText(/no tasks yet/i)).toBeInTheDocument();
  });

  test("renders one list item per task", () => {
    const tasks = [
      { id: 1, title: "Task A", completed: false },
      { id: 2, title: "Task B", completed: true },
    ];
    render(<TaskList tasks={tasks} onToggle={() => {}} onDelete={() => {}} />);

    expect(screen.getAllByRole("listitem")).toHaveLength(2);
    expect(screen.getByText("Task A")).toBeInTheDocument();
    expect(screen.getByText("Task B")).toBeInTheDocument();
  });
});
