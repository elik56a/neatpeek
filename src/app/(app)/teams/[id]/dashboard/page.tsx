"use client";

import { TeamDashboard } from "@/features/team";
import { useAppDataContext } from "@/providers";
import { useEffect, useState } from "react";

export default function TeamDashboardPage({ params }: { params: { id: string } }) {
  const { companyId, isCompanyAdmin } = useAppDataContext();
  const [isTeamAdmin, setIsTeamAdmin] = useState(false);

  // Extract the ID directly to avoid the warning
  const teamId = params.id;

  useEffect(() => {
    const checkTeamAdmin = async () => {
      if (!companyId) return;

      try {
        const response = await fetch(`/api/teams/${teamId}`);

        if (response.ok) {
          const team = await response.json();
          // Check if the current user is the team owner
          setIsTeamAdmin(isCompanyAdmin || team.ownerId === companyId);
        }
      } catch (error) {
        console.error("Error checking team admin status:", error);
      }
    };

    checkTeamAdmin();
  }, [teamId, companyId, isCompanyAdmin]);

  return (
    <div className="container py-10">
      <TeamDashboard teamId={teamId} isTeamAdmin={isTeamAdmin} />
    </div>
  );
}
