import { useState } from "react";
import { useToast } from "@/hooks/use-toast";
import usePro from "@/hooks/usePro";
import { useSponsorsData } from "@/hooks/useSponsorsData";
import DashboardTop from "@/components/sponsors/DashboardTop";
import OutreachKits from "@/components/sponsors/OutreachKits";
import ReadinessAssessment from "@/components/sponsors/ReadinessAssessment";
import SponsorPackGenerator from "@/components/sponsors/SponsorPackGenerator";
import DealsBoard from "@/components/sponsors/DealsBoard";
import ActivationMetrics from "@/components/sponsors/ActivationMetrics";
import ActivationSurveyForm from "@/components/feedback/ActivationSurveyForm";

export default function SponsorsTool() {
	const { toast } = useToast();
	const { isPro, loading: proLoading } = usePro();
	const data = useSponsorsData();
	const [activeSegment, setActiveSegment] = useState<string | null>(null);

	const handleCreateTask = (title: string, dueDate: string) => {
		data.createTask({ title, dueDate, category: "outreach" });
		toast({
			title: "Task created",
			description: `${title} · due ${new Date(dueDate + "T00:00:00").toLocaleDateString()}`,
		});
	};

	return (
		<div className="max-w-6xl mx-auto px-4 py-10 space-y-8">
			<DashboardTop
				packCompletion={data.packCompletion}
				checklist={data.checklist}
				meetings={data.meetings}
				upcomingActivations={data.upcomingActivations}
				leadMetrics={data.leadMetrics}
				pipelineCounts={data.pipelineCounts}
				tasks={data.tasks}
				onCompleteTask={(id) => {
					data.markTaskDone(id);
					toast({ title: "Task completed", description: "Great work — keep momentum going." });
				}}
				onSelectSegment={(segment) => setActiveSegment(segment)}
				activeSegment={activeSegment}
				prospects={data.prospects}
			/>

			<OutreachKits
				isPro={isPro}
				loading={proLoading}
				activeSegment={activeSegment}
				onSegmentChange={(segment) => setActiveSegment(segment)}
				onCreateTask={(title, dueDate) => handleCreateTask(title, dueDate)}
				onCopy={() =>
					toast({
						title: "Template copied",
						description: "Placeholders are intact. Paste and customize before sending.",
					})
				}
			/>

			<div className="grid gap-6 lg:grid-cols-[1.05fr,0.95fr]">
				<ReadinessAssessment
					onCreateTasks={(tasks) => {
						tasks.forEach((task) => handleCreateTask(task.title, task.dueDate));
						toast({
							title: "Next steps added",
							description: "Assessment tasks dropped onto your board.",
						});
					}}
				/>
				<SponsorPackGenerator
					profile={data.profile}
					assets={data.assets}
					prospects={data.prospects}
					activations={data.activations}
				/>
			</div>

			<DealsBoard
				prospects={data.prospects}
				onStageChange={(id, stage) => {
					data.updateProspectStage(id, stage);
					toast({ title: "Stage updated", description: `${stage} selected for this partner.` });
				}}
			/>

			<ActivationMetrics activations={data.activations} />

			<ActivationSurveyForm
				prospectId={data.prospects[0]?.id ?? ""}
				onComplete={() => {
					toast({
						title: "Activation survey saved",
						description: "Metrics logged and feedback queued for review.",
					});
				}}
			/>
		</div>
	);
}
