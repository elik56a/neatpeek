"use client";

import { LoginPage } from "@/features/auth/components/pages";
import { Suspense } from "react";

export default function Login() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <LoginPage />
    </Suspense>
  );
}
