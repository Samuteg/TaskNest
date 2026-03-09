import { Suspense } from "react";
import ResetPasswordForm from "./ResetPasswordForm";

export default function ResetPasswordPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-[#0d0d0f]" />}>
      <ResetPasswordForm />
    </Suspense>
  );
}