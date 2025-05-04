"use client";

import { RegisterPage } from "@/features/auth/components/pages";
import { Suspense } from "react";

export default function Register() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <RegisterPage />
    </Suspense>
  );
}
