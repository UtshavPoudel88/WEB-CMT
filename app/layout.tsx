import "./globals.css";


import NavBar from "./components/NavBar";
import { AuthProvider } from "../lib/context/AuthContext";

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className="app-bg min-h-screen text-foreground">
        <AuthProvider>
          <NavBar />
          <main className="max-w-6xl mx-auto px-4 py-10 flex flex-col gap-8">
            {children}
          </main>
        </AuthProvider>
      </body>
    </html>
  );
}
