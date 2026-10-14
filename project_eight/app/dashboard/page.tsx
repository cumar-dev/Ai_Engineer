import { getUserInfo } from "@/server/user";
import { redirect } from "next/navigation";
import { connection } from "next/server";
import React from "react";

const dashboard = async () => {
  await connection();
  const session = await getUserInfo();
  if (!session) {
    return redirect("/SignIn");
  }
  return (
    <>
      <div>
        <p>Welcome, {session.user.name}</p>
        <p>Email: {session.user.email}</p>
      </div>
    </>
  );
};

export default dashboard;
