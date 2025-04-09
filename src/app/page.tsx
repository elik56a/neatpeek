"use client";

import { Loader } from "lucide-react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

export default function Home() {
  const { data: session, status } = useSession();
  const router = useRouter();

  useEffect(() => {
    if (status === "loading") return;

    if (session) {
      router.push("/dashboard");
    } else {
      router.push("/login");
    }
  }, [session, status, router]);

  return (
    <div className="h-screen flex items-center justify-center">
      <div className="flex flex-col items-center">
        <Loader className="h-10 w-10 animate-spin text-brand-600" />
        <p className="mt-4 text-lg">Loading...</p>
      </div>
    </div>
  );
}
