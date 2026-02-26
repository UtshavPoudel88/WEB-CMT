import { NextResponse } from "next/server";

// Demo user store
const users: { email: string; password: string; name: string; role: string }[] = [
  { email: "admin@example.com", password: "admin123", name: "Admin", role: "admin" },
  { email: "user@example.com", password: "user123", name: "User", role: "user" },
];

export async function POST(req: Request) {
  const { email, password } = await req.json();
  const user = users.find(u => u.email === email && u.password === password);
  if (!user) {
    return NextResponse.json({ message: "Invalid credentials" }, { status: 401 });
  }
  return NextResponse.json({ role: user.role, name: user.name });
}
