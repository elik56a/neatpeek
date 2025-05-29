"use client";

import { use } from "react";
import { TeamEditForm } from "@/features/team";
import { PageParams } from "@/types/general";

interface TeamEditPageProps extends PageParams<{ id: string }> {}

export default function TeamEditPage({ params }: TeamEditPageProps) {
  const { id } = use(params);

  return (
    <div className="container py-10">
      <TeamEditForm teamId={id} />
    </div>
  );
}
