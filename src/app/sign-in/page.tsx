import { AuthForm } from "../components/auth/auth-form";
import { AuthLayout } from "../components/auth/auth-layout";

export default function SignInPage() {
  return (
    <AuthLayout title="Welcome back" description="Sign in with your email and password to open your dashboard.">
      <AuthForm mode="sign-in" />
    </AuthLayout>
  );
}
