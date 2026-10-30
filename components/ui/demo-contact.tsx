import React from 'react';
import { ContactCard } from "@/components/ui/contact-card";
import { MailIcon, ShieldCheckIcon, GlobeIcon, UserIcon } from 'lucide-react';

export default function DefaultDemo() {
	return (
		<main className="relative flex size-full min-h-screen w-full items-center justify-center p-4 bg-[#030712] text-white">
			<div className="mx-auto max-w-5xl w-full">
				<ContactCard
					title="Get in touch"
					description="If you have any questions regarding HarshGuruJi services, AI tools, or need technical assistance, please fill out the form here. We respond within 1 business day."
					contactInfo={[
						{
							icon: MailIcon,
							label: 'General & Support',
							value: 'contact@webguruji.online',
						},
						{
							icon: ShieldCheckIcon,
							label: 'Legal & DMCA',
							value: 'contact@webguruji.online',
						},
						{
							icon: GlobeIcon,
							label: 'Headquarters',
							value: 'India (IST Timezone) • Mon-Sat 9AM-7PM',
							className: 'col-span-2',
						},
						{
							icon: UserIcon,
							label: 'Founder & Creator',
							value: 'Harsh Patel (WebGuruJi Ecosystem)',
							className: 'col-span-2',
						}
					]}
				>
					<form 
						onSubmit={(e) => {
							e.preventDefault();
							alert('Thank you for contacting HarshGuruJi! Your message has been received.');
						}} 
						className="w-full space-y-4"
					>
						<div className="flex flex-col gap-1.5">
							<label className="text-xs font-medium text-slate-300">Name</label>
							<input 
								type="text" 
								required 
								placeholder="e.g. Rahul Sharma"
								className="w-full rounded-xl border border-slate-800 bg-slate-950 px-3.5 py-2.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500" 
							/>
						</div>
						<div className="flex flex-col gap-1.5">
							<label className="text-xs font-medium text-slate-300">Email</label>
							<input 
								type="email" 
								required 
								placeholder="e.g. rahul@example.com"
								className="w-full rounded-xl border border-slate-800 bg-slate-950 px-3.5 py-2.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500" 
							/>
						</div>
						<div className="flex flex-col gap-1.5">
							<label className="text-xs font-medium text-slate-300">Inquiry Category</label>
							<select className="w-full rounded-xl border border-slate-800 bg-slate-950 px-3.5 py-2.5 text-xs text-white focus:outline-none focus:border-indigo-500">
								<option value="general">General Support & Feedback</option>
								<option value="ai">GuruAI & Model Quota</option>
								<option value="tools">Web Utility Bug Report</option>
								<option value="legal">Legal, Privacy & DMCA</option>
							</select>
						</div>
						<div className="flex flex-col gap-1.5">
							<label className="text-xs font-medium text-slate-300">Message</label>
							<textarea 
								required 
								rows={4}
								placeholder="How can we assist you today?"
								className="w-full rounded-xl border border-slate-800 bg-slate-950 px-3.5 py-2.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500 resize-none" 
							/>
						</div>
						<button 
							type="submit"
							className="w-full py-2.5 px-4 rounded-xl font-bold text-xs text-white bg-gradient-to-r from-indigo-500 to-cyan-500 hover:from-indigo-600 hover:to-cyan-600 shadow-lg shadow-indigo-500/25 transition-all"
						>
							Send Message →
						</button>
					</form>
				</ContactCard>
			</div>
		</main>
	);
}
