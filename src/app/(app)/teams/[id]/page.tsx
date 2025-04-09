"use client";

import { TeamDetail } from "@/features/team";

export default function TeamDetailPage({ params }: { params: { id: string } }) {
  return (
    <div className="container py-10">
      <TeamDetail teamId={params.id} />
    </div>
  );
}
