import { NextResponse } from "next/server";

// Demo user store
const users: { email: string; password: string; name: string; role: string }[] = [
  { email: "admin@example.com", password: "admin123", name: "Admin", role: "admin" },
  { email: "user@example.com", password: "user123", name: "User", role: "user" },
];

export async function POST(req: Request) {
  const { email, password, name } = await req.json();
  if (!email || !password || !name) {
    return NextResponse.json({ message: "All fields required" }, { status: 400 });
  }
  // Check if user exists
  const exists = users.find(u => u.email === email);
  if (exists) {
    return NextResponse.json({ message: "User already exists" }, { status: 409 });
  }
  // For demo, treat admin@example.com as admin
  const role = email === "admin@example.com" ? "admin" : "user";
  users.push({ email, password, name, role });
  return NextResponse.json({ role, name });
}
