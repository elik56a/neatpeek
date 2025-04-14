"use client";

import { TeamEditForm } from "@/features/team";

export default function TeamEditPage({ params }: { params: { id: string } }) {
  // Extract the ID directly to avoid the warning
  const teamId = params.id;

  return (
    <div className="container py-10">
      <TeamEditForm teamId={teamId} />
    </div>
  );
}
