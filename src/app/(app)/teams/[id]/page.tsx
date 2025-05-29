"use client";

import { use } from "react";
import { TeamDetail } from "@/features/team";
import { PageParams } from "@/types/general";

interface TeamDetailPageProps extends PageParams<{ id: string }> {}

export default function TeamDetailPage({ params }: TeamDetailPageProps) {
  const { id } = use(params);

  return (
    <div className="container py-10">
      <TeamDetail teamId={id} />
    </div>
  );
}
