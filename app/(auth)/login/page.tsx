"use client";

import LoginForm from "../_components/LoginForm";

// Another minor change for commit
export default function Page() {
    return (
        <div
            className="min-h-screen w-full flex items-center justify-center"
            style={{
                backgroundImage: 'url(/images/ho-bg.jpg)',
                backgroundSize: 'cover',
                backgroundPosition: 'center',
            }}
        >
            <h1 className="text-4xl font-bold text-white drop-shadow-lg">Login Page</h1>
        </div>
    );
}