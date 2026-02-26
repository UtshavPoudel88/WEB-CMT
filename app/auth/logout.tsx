"use client";
import React, { useEffect } from "react";
import { useRouter } from "next/navigation";

const Logout = () => {
  const router = useRouter();
  useEffect(() => {
    // Clear session (demo)
    router.push("/");
  }, [router]);
  return (
    <div className="flex items-center justify-center min-h-screen">
      <span>Logging out...</span>
    </div>
  );
};

export default Logout;
