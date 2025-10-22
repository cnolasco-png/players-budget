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
import SponsorCampaignManager from "@/components/sponsors/SponsorCampaignManager";
import { AppTopBar } from "@/components/layout/AppTopBar";

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
		<div className="min-h-screen bg-primary">
			<AppTopBar title="Sponsors" subtitle="Build repeatable sponsor revenue and elite activation systems" />

			<main className="mx-auto max-w-6xl space-y-8 px-4 py-10">
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
					campaigns={data.campaigns}
				/>
			</div>

				<DealsBoard
					prospects={data.prospects}
					onStageChange={(id, stage) => {
						data.updateProspectStage(id, stage);
						toast({ title: "Stage updated", description: `${stage} selected for this partner.` });
					}}
					onUpdateProspect={data.updateProspect}
					onCreateProspect={data.createProspect}
					onDeleteProspect={data.deleteProspect}
					onExport={() => data.exportProspects()}
				/>

				<ActivationMetrics
					activations={data.activations}
					prospects={data.prospects}
					onCreateActivation={data.addActivation}
					onUpdateActivation={data.updateActivation}
					onDeleteActivation={data.deleteActivation}
					onExport={data.exportActivations}
				/>

				<ActivationSurveyForm
					prospects={data.prospects}
					defaultProspectId={data.prospects[0]?.id}
					onRecordActivation={(activation) => data.addActivation(activation)}
					onComplete={() => {
						toast({
							title: "Activation survey saved",
							description: "Metrics logged and feedback queued for review.",
						});
					}}
				/>

				<SponsorCampaignManager
					campaigns={data.campaigns}
					onCreate={(input) => data.createCampaign(input)}
					onUpdate={data.updateCampaign}
					onDelete={data.deleteCampaign}
					onDuplicate={(id) => data.duplicateCampaign(id)}
				/>
			</main>
		</div>
	);
}
