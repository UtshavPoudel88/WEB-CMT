import { render, screen } from "@testing-library/react";

import userEvent from "@testing-library/user-event";
import Register from "@/app/auth/register/page";
import { useRouter } from "next/navigation";
import { registerUser } from "@/lib/api/auth";

jest.mock("next/navigation", () => ({
  useRouter: jest.fn(),
}));

jest.mock("@/lib/api/auth", () => ({
  registerUser: jest.fn(),
}));

const mockedUseRouter = useRouter as jest.Mock;
const mockedRegisterUser = registerUser as jest.MockedFunction<typeof registerUser>;

describe("Register page", () => {
  const push = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
    mockedUseRouter.mockReturnValue({ push });
  });

  it("renders core form fields", () => {
    render(<Register />);

    expect(screen.getByLabelText(/name/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/email/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/^password$/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/confirm password/i)).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /create account/i })).toBeInTheDocument();
  });

  it("toggles password visibility", async () => {
    const user = userEvent.setup();
    render(<Register />);

    const passwordInput = screen.getByLabelText(/^password$/i);
    const [passwordToggle] = screen.getAllByRole("button", { name: /show/i });

    expect(passwordInput).toHaveAttribute("type", "password");
    await user.click(passwordToggle);
    expect(passwordInput).toHaveAttribute("type", "text");
    await user.click(screen.getByRole("button", { name: /hide/i }));
    expect(passwordInput).toHaveAttribute("type", "password");
  });

  it("shows strong-password validation error", async () => {
    const user = userEvent.setup();
    render(<Register />);

    await user.type(screen.getByLabelText(/name/i), "John");
    await user.type(screen.getByLabelText(/email/i), "john@example.com");
    await user.type(screen.getByLabelText(/^password$/i), "weak");
    await user.type(screen.getByLabelText(/confirm password/i), "weak");
    await user.click(screen.getByRole("button", { name: /create account/i }));

    expect(
      screen.getByText(/password must be at least 5 characters and include uppercase/i)
    ).toBeInTheDocument();
    expect(mockedRegisterUser).not.toHaveBeenCalled();
  });

  it("shows mismatch error when confirmation differs", async () => {
    const user = userEvent.setup();
    render(<Register />);

    await user.type(screen.getByLabelText(/name/i), "John");
    await user.type(screen.getByLabelText(/email/i), "john@example.com");
    await user.type(screen.getByLabelText(/^password$/i), "Strong1!");
    await user.type(screen.getByLabelText(/confirm password/i), "Strong2!");
    await user.click(screen.getByRole("button", { name: /create account/i }));

    expect(screen.getByText(/password and confirm password must match/i)).toBeInTheDocument();
    expect(mockedRegisterUser).not.toHaveBeenCalled();
  });

  it("submits valid form and redirects to login", async () => {
    const user = userEvent.setup();
    mockedRegisterUser.mockResolvedValue({
      success: true,
      data: {
        _id: "1",
        name: "John",
        email: "john@example.com",
      },
    });

    render(<Register />);

    await user.type(screen.getByLabelText(/name/i), "John");
    await user.type(screen.getByLabelText(/email/i), "john@example.com");
    await user.type(screen.getByLabelText(/^password$/i), "Strong1!");
    await user.type(screen.getByLabelText(/confirm password/i), "Strong1!");
    await user.click(screen.getByRole("button", { name: /create account/i }));

    expect(mockedRegisterUser).toHaveBeenCalledWith({
      name: "John",
      email: "john@example.com",
      password: "Strong1!",
    });
    expect(push).toHaveBeenCalledWith("/auth/login");
  });
});