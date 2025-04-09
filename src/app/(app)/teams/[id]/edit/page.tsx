"use client";

import { TeamEditForm } from "@/features/team";

export default function TeamEditPage({ params }: { params: { id: string } }) {
  return (
    <div className="container py-10">
      <TeamEditForm teamId={params.id} />
    </div>
  );
}
