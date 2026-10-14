
"use client";

import { authClient } from "@/lib/auth-client";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

const dashboardClient = () => {
  const router = useRouter();

  const { data: session, isPending } = authClient.useSession();

  useEffect(() => {
    if (!isPending && !session) {
      router.replace("/SignIn");
    }
  }, [isPending, session, router]);

  if (isPending) {
    return <p>Loading dashboard...</p>;
  }

  if (!session) {
    return null;
  }

  return (
    <div>
      <h1>Welcome, {session.user.name}</h1>
      <p>Email: {session.user.email}</p>

      <button
        onClick={async () => {
          await authClient.signOut();
          router.replace("/SignIn");
        }}
      >
        Sign Out
      </button>
    </div>
  );
};

export default dashboardClient;
