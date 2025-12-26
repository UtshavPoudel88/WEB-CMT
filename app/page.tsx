
import Link from "next/link";

export default function Home() {
	return (
		<>
			<nav className="flex justify-between items-center px-8 py-4 bg-transparent w-full absolute top-0 left-0 z-10">
				<div className="text-white text-2xl font-bold">CineFlix</div>
				<div className="flex gap-4 bg-[#6b7280]/60 rounded-full px-6 py-2">
					<Link href="/" className="text-white font-medium px-2 py-1 hover:underline">Home</Link>
					<Link href="/about" className="text-white font-medium px-2 py-1 hover:underline">About</Link>
					<Link href="/movies" className="text-white font-medium px-2 py-1 hover:underline">Movies</Link>
					<Link href="/ticket-rate" className="text-white font-medium px-2 py-1 hover:underline">Ticket Rate</Link>
				</div>
				<div className="flex gap-2">
					<Link href="/login" className="bg-[#23272a] text-white font-semibold px-4 py-2 rounded-lg shadow hover:bg-[#343a40] transition">Log in</Link>
					<Link href="/register" className="bg-[#6b7280] text-white font-semibold px-4 py-2 rounded-lg shadow hover:bg-[#23272a] transition">Sign up</Link>
				</div>
			</nav>
			<main
				className="flex flex-col items-center justify-center min-h-screen w-full"
				style={{
					backgroundImage: 'url(/images/ho-bg.jpg)',
					backgroundSize: 'cover',
					backgroundPosition: 'center',
				}}
			>
				<h1 className="text-4xl font-bold mb-4 text-white drop-shadow-lg">Welcome to the Home Page</h1>
			</main>
		</>
	);
}
