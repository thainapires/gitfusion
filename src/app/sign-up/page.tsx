import { AuthForm } from "@/features/auth/components/auth-form";
import { AuthLayout } from "@/features/auth/components/auth-layout";

export default function SignUpPage() {
  return (
    <AuthLayout title="Create your account" description="Create your account with email, password, and an optional profile photo.">
      <AuthForm mode="sign-up" />
    </AuthLayout>
  );
}
