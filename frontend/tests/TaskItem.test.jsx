import { describe, test, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import TaskItem from "../src/components/TaskItem";

const task = { id: 1, title: "Write tests", completed: false };

describe("TaskItem", () => {
  test("renders the task title", () => {
    render(<TaskItem task={task} onToggle={() => {}} onDelete={() => {}} />);
    expect(screen.getByText("Write tests")).toBeInTheDocument();
  });

  test("calls onToggle with the task id when the checkbox is clicked", async () => {
    const user = userEvent.setup();
    const onToggle = vi.fn();
    render(<TaskItem task={task} onToggle={onToggle} onDelete={() => {}} />);

    await user.click(screen.getByRole("checkbox"));

    expect(onToggle).toHaveBeenCalledWith(1, true);
  });

  test("calls onDelete with the task id when Delete is clicked", async () => {
    const user = userEvent.setup();
    const onDelete = vi.fn();
    render(<TaskItem task={task} onToggle={() => {}} onDelete={onDelete} />);

    await user.click(screen.getByRole("button", { name: /delete write tests/i }));

    expect(onDelete).toHaveBeenCalledWith(1);
  });
});
