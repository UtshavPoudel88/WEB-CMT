import Image from "next/image";

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <main className="relative min-h-screen w-full overflow-hidden">
      {/* Background */}
      <Image
        src="/images/bg.png"
        alt="background"
        fill
        priority
        className="object-cover"
      />

      {/* Overlay */}
      <div className="absolute inset-0" />

      {/* Content */}
      <div className="relative z-10 min-h-screen flex items-center justify-center px-4">
        <section className="w-full max-w-md bg-white/90 dark:bg-black/50 backdrop-blur-xl rounded-2xl shadow-2xl border border-gray-200/30 p-8">
  {/* Logo */}
  <div className="flex justify-center mb-6">
    <Image
      src="/images/main_logo_.png"
      alt="Logo"
      width={120}
      height={120}
      className="rounded-full border-4 border-white shadow-lg"
      priority
    />
  </div>

  {/* Form or children */}
  {children}
</section>

      </div>
    </main>
  );
}
