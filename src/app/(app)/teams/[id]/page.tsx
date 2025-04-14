"use client";

import { TeamDetail } from "@/features/team";

export default function TeamDetailPage({ params }: { params: { id: string } }) {
  // Extract the ID directly to avoid the warning
  const teamId = params.id;

  return (
    <div className="container py-10">
      <TeamDetail teamId={teamId} />
    </div>
  );
}
