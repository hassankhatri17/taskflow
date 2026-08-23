import { describe, test, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import RegisterForm from "../src/components/RegisterForm";

describe("RegisterForm", () => {
  test("renders the register form", () => {
    render(<RegisterForm onRegister={() => {}} />);
    expect(screen.getByRole("form", { name: /register form/i })).toBeInTheDocument();
  });

  test("rejects a password shorter than 6 characters", async () => {
    const user = userEvent.setup();
    const onRegister = vi.fn();
    render(<RegisterForm onRegister={onRegister} />);

    await user.type(screen.getByLabelText(/email/i), "bob@example.com");
    await user.type(screen.getByLabelText(/password/i), "123");
    await user.click(screen.getByRole("button", { name: /sign up/i }));

    expect(await screen.findByRole("alert")).toHaveTextContent(/at least 6 characters/i);
    expect(onRegister).not.toHaveBeenCalled();
  });

  test("submits successfully with valid input", async () => {
    const user = userEvent.setup();
    const onRegister = vi.fn();
    render(<RegisterForm onRegister={onRegister} />);

    await user.type(screen.getByLabelText(/email/i), "bob@example.com");
    await user.type(screen.getByLabelText(/password/i), "password123");
    await user.click(screen.getByRole("button", { name: /sign up/i }));

    expect(onRegister).toHaveBeenCalledWith({
      email: "bob@example.com",
      password: "password123",
    });
  });
});
