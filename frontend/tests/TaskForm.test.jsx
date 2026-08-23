import { describe, test, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import TaskForm from "../src/components/TaskForm";

describe("TaskForm", () => {
  test("renders an input and an add button", () => {
    render(<TaskForm onAdd={() => {}} />);
    expect(screen.getByLabelText(/new task/i)).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /add task/i })).toBeInTheDocument();
  });

  test("does not call onAdd and shows an error for an empty title", async () => {
    const user = userEvent.setup();
    const onAdd = vi.fn();
    render(<TaskForm onAdd={onAdd} />);

    await user.click(screen.getByRole("button", { name: /add task/i }));

    expect(await screen.findByRole("alert")).toHaveTextContent(/cannot be empty/i);
    expect(onAdd).not.toHaveBeenCalled();
  });

  test("calls onAdd with the trimmed title and clears the input", async () => {
    const user = userEvent.setup();
    const onAdd = vi.fn();
    render(<TaskForm onAdd={onAdd} />);

    const input = screen.getByLabelText(/new task/i);
    await user.type(input, "  Buy milk  ");
    await user.click(screen.getByRole("button", { name: /add task/i }));

    expect(onAdd).toHaveBeenCalledWith("Buy milk");
    expect(input).toHaveValue("");
  });
});
