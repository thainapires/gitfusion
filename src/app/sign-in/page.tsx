import { AuthForm } from "@/features/auth/components/auth-form";
import { AuthLayout } from "@/features/auth/components/auth-layout";

export default function SignInPage() {
  return (
    <AuthLayout title="Welcome back" description="Sign in with your email and password to open your dashboard.">
      <AuthForm mode="sign-in" />
    </AuthLayout>
  );
}
