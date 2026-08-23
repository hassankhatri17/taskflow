import { describe, test, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import LoginForm from "../src/components/LoginForm";

describe("LoginForm", () => {
  test("renders email, password fields and submit button", () => {
    render(<LoginForm onLogin={() => {}} />);

    expect(screen.getByLabelText(/email/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/password/i)).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /log in/i })).toBeInTheDocument();
  });

  test("shows a validation error when submitted empty", async () => {
    const user = userEvent.setup();
    const onLogin = vi.fn();
    render(<LoginForm onLogin={onLogin} />);

    await user.click(screen.getByRole("button", { name: /log in/i }));

    expect(await screen.findByRole("alert")).toHaveTextContent(/required/i);
    expect(onLogin).not.toHaveBeenCalled();
  });

  test("calls onLogin with entered credentials on valid submit", async () => {
    const user = userEvent.setup();
    const onLogin = vi.fn();
    render(<LoginForm onLogin={onLogin} />);

    await user.type(screen.getByLabelText(/email/i), "alice@example.com");
    await user.type(screen.getByLabelText(/password/i), "secret123");
    await user.click(screen.getByRole("button", { name: /log in/i }));

    expect(onLogin).toHaveBeenCalledWith({
      email: "alice@example.com",
      password: "secret123",
    });
  });
});
