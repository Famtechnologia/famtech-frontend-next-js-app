// app/(dashboard)/page.tsx
"use client";
import RequestResetForm from '../../../components/auth/RequestResetForm'

import { useEffect } from "react";

export default function Page() {
  useEffect(() => {
    // You can run client-side logic here if needed
    console.log("Dashboard Home mounted");
  }, []);

  return (
    <RequestResetForm />
  );
}
