"use client";

import { TeamDashboard } from "@/features/team";
import { useCompanyContext } from "@/features/company/components/CompanyProvider";
import { useEffect, useState } from "react";

export default function TeamDashboardPage({ params }: { params: { id: string } }) {
  const { companyId, isCompanyAdmin } = useCompanyContext();
  const [isTeamAdmin, setIsTeamAdmin] = useState(false);

  useEffect(() => {
    const checkTeamAdmin = async () => {
      if (!companyId) return;

      try {
        const response = await fetch(`/api/teams/${params.id}`);
        
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
  }, [params.id, companyId, isCompanyAdmin]);

  return (
    <div className="container py-10">
      <TeamDashboard teamId={params.id} isTeamAdmin={isTeamAdmin} />
    </div>
  );
}
