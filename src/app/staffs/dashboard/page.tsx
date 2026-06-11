"use client";
import { useEffect } from "react";
import { useRouter } from "next/navigation";

export default function StaffDashboardRedirect() {
  const router = useRouter();

  useEffect(() => {
    router.replace("/staffs/tasks");
  }, [router]);

  return null;
}

