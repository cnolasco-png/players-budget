import { useState } from "react";
import { usePro } from "@/hooks/usePro";

const DM_TEMPLATE = `Hey [Brand], I’m [Name], an [level] tennis player traveling to [cities] this season...`;
const EMAIL_SUBJECT = `Local athlete partnership — [Your Name] · [City]`;
const EMAIL_BODY = `Hi [Name],\n\nI compete on the [circuit] with ~[monthly reach]...`;

export default function SponsorsTool() {
	const { isPro } = usePro();
	const [copied, setCopied] = useState("");

	const copy = async (t: string) => {
		await navigator.clipboard.writeText(t);
		setCopied("Copied!");
		setTimeout(() => setCopied(""), 1200);
	};

	return (
		<div className="mx-auto max-w-5xl p-6 space-y-6">
			<header>
				<h1 className="text-2xl font-semibold">Sponsor Tool</h1>
				<p className="text-sm text-muted-foreground">
					Download your deck, copy proven outreach, and (on Pro) personalize.
				</p>
			</header>

			<div className="flex flex-wrap gap-3">
				<a
					href="/sponsor-tool.pdf"
					target="_blank"
					rel="noopener noreferrer"
					className="inline-flex items-center px-3 py-2 rounded-md bg-primary text-primary-foreground hover:opacity-90"
				>
					Download deck template (PDF)
				</a>
				<button className="btn" onClick={() => copy(DM_TEMPLATE)}>
					Copy DM
				</button>
				<button
					className="btn"
					onClick={() =>
						copy(`Subject: ${EMAIL_SUBJECT}\n\n${EMAIL_BODY}`)
					}
				>
					Copy Email
				</button>
				<button
					className="btn"
					onClick={() => copy(`Day 1..7 outreach plan ...`)}
				>
					Copy 7-day plan
				</button>
				{copied && (
					<span className="text-xs text-green-700">{copied}</span>
				)}
			</div>

			<section className="grid md:grid-cols-2 gap-6">
				<div className="p-4 border rounded-xl">
					<h3 className="font-medium mb-2">Get discovered</h3>
					<ul className="list-disc pl-5 space-y-1 text-sm">
						<li>
							<a
								href="https://www.levanta.io"
								target="_blank"
								rel="noopener"
							>
								Levanta
							</a>
						</li>
						<li>
							<a
								href="https://joinbrands.com"
								target="_blank"
								rel="noopener"
							>
								JoinBrands
							</a>
						</li>
						<li>
							Player X (powered by WolfPro) — coming soon
						</li>
					</ul>
				</div>
				<div className="p-4 border rounded-xl">
					<h3 className="font-medium mb-2">Be easy to contact</h3>
					<ul className="list-disc pl-5 space-y-1 text-sm">
						<li>Contact button in IG/TikTok/YouTube bios</li>
						<li>
							Link-in-bio: deck, contact form, schedule, media kit
						</li>
						<li>Highlight: “Work With Me”</li>
					</ul>
				</div>
			</section>

			<section className="relative p-4 border rounded-xl">
				{!isPro && (
					<div className="absolute inset-0 bg-black/40 text-white grid place-items-center rounded-xl">
						<div className="bg-white text-black rounded-lg px-4 py-3">
							Pro feature — Personalize PDF (locked)
						</div>
					</div>
				)}
				<h3 className="font-medium mb-2">Personalize your PDF (Pro)</h3>
				<div className="grid md:grid-cols-2 gap-3 opacity-100">
					<input className="input" placeholder="Player name" />
					<input className="input" placeholder="Level / Circuit" />
					<input className="input" placeholder="Current ranking" />
					<input className="input" placeholder="Best ranking" />
					<textarea
						className="input md:col-span-2"
						placeholder="Socials + next 90-day schedule"
					/>
				</div>
				<div className="mt-3 flex gap-2">
					<button className="btn" disabled>
						Generate personalized PDF
					</button>
					<button className="btn" disabled>
						Create live sponsor link
					</button>
				</div>
			</section>
		</div>
	);
}
