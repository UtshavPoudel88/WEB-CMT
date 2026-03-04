import { NextResponse } from "next/server";


// Simulated user database
let users = [
  {
    username: "utshav",
    email: "utshav@example.com",
    password: "utshav123",
    profilePhoto: "https://via.placeholder.com/120"
  },
  {
    username: "user123",
    email: "user@example.com",
    password: "user123",
    profilePhoto: "https://via.placeholder.com/120"
  }
];

export async function GET(req: Request) {
  // Simulate getting current user (replace with real auth/session logic)
  const email = req.headers.get("x-user-email") || "utshav@example.com";
  const user = users.find(u => u.email === email);
  if (!user) return NextResponse.json({ message: "User not found" }, { status: 404 });
  return NextResponse.json(user);
}

export async function PUT(req: Request) {
  const email = req.headers.get("x-user-email") || "utshav@example.com";
  const user = users.find(u => u.email === email);
  if (!user) return NextResponse.json({ message: "User not found" }, { status: 404 });

  const formData = await req.json();
  user.username = formData.username || user.username;
  user.email = formData.email || user.email;
  user.password = formData.password || user.password;
  user.profilePhoto = formData.profilePhoto || user.profilePhoto;

  return NextResponse.json(user);
}
