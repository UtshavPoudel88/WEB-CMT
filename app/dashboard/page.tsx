"use client";

export default function DashboardPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-[#2b2e4a] to-[#eaeaea]">
      <div className="bg-white/80 rounded-2xl shadow-xl p-12 flex flex-col items-center max-w-lg w-full">
        <div className="mb-6">
          <img src="/images/community-talks-logo.png" alt="Community Talks" className="w-40 h-40 object-contain rounded-xl shadow-md" />
        </div>
        <h1 className="text-3xl font-bold text-[#2b2e4a] mb-2">Welcome to Community Talks</h1>
        <p className="text-lg text-gray-700 mb-6 text-center">This is your dashboard. You are now logged in!</p>
        <div className="w-full flex flex-col gap-4">
          <button className="bg-[#2563eb] text-white font-semibold py-2 rounded-lg shadow hover:bg-[#1d4ed8] transition">Start a New Talk</button>
          <button className="bg-white border border-[#2563eb] text-[#2563eb] font-semibold py-2 rounded-lg shadow hover:bg-[#2563eb] hover:text-white transition">View My Talks</button>
        </div>
      </div>
    </div>
  );
}
