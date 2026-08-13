"use client";

import { useState, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import LoginScreen, { type LoginValues } from "@/components/onboarding/LoginScreen";
import { useLogin } from "@/hooks/auth.hook";

function LoginContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirectUrl = searchParams.get("redirect") || "/dashboard";
  const loginMutation = useLogin();
  const [error, setError] = useState<string | undefined>();

  const handleSubmit = async (values: LoginValues) => {
    setError(undefined);
    try {
      await loginMutation.mutateAsync({ email: values.email, password: values.password });
      // Redirect to the original URL or home
      router.push(decodeURIComponent(redirectUrl));
    } catch (err) {
      setError(err instanceof Error ? err.message : "Incorrect password please try again.");
    }
  };

  return (
    <LoginScreen
      onSubmit={handleSubmit}
      onGoogleLogin={() => {
        // kick off OAuth flow
      }}
      isSubmitting={loginMutation.isPending}
      error={error}
      signUpHref="/signup"
    />
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={null}>
      <LoginContent />
    </Suspense>
  );
}