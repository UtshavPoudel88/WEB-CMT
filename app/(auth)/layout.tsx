import Image from "next/image";

export default function Layout({ children }: { children: React.ReactNode }) {
    return (
        <section className="min-h-screen w-full flex items-center justify-center" style={{
            background: 'url(/images/bg.png) center center / cover no-repeat',
        }}>
            <div className="flex flex-col md:flex-row items-center justify-center w-full h-full min-h-screen p-2 md:p-0">
                {/* Glassmorphism Login Box */}
                <div className="backdrop-blur-[8px] bg-white/20 border border-white/30 rounded-2xl shadow-2xl flex flex-col justify-center p-6 md:p-10 w-full max-w-md md:min-h-[520px] min-h-[420px]" style={{maxWidth: 420}}>
                    {children}
                </div>
                {/* ...logo removed... */}
            </div>
        </section>
    );
}