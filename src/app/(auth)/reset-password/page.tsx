// app/reset-password/[token]/page.jsx
import ResetPasswordForm from "@/components/auth/ResetPassword";

interface ResetPasswordPageProps {
  searchParams: Promise<{
    token?: string;
  }>;
}

export default async function ResetPasswordPage({
  searchParams,
}: ResetPasswordPageProps) {
  const resolvedSearchParams = await searchParams;
  const token = resolvedSearchParams.token || "";
  return <ResetPasswordForm token={token} />;
}
