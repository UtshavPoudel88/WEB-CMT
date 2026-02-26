"use client";
import React from "react";

const CurrentUser = () => {
  // Demo: show static user
  return (
    <div className="flex items-center justify-center min-h-screen">
      <div className="bg-white p-8 rounded shadow-md">
        <h2 className="text-2xl font-bold mb-4">Current User</h2>
        <p>Email: user@example.com</p>
        <p>Name: User</p>
      </div>
    </div>
  );
};

export default CurrentUser;
