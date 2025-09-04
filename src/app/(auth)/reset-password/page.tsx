// app/reset-password/[token]/page.jsx
import ResetPasswordForm from "@/components/auth/ResetPassword";

interface ResetPasswordPageProps {
  params: {
    token: string;
  };
}

export default function ResetPasswordPage({ params }: ResetPasswordPageProps) {
  const { token } = params;
  return <ResetPasswordForm token={token} />;
}