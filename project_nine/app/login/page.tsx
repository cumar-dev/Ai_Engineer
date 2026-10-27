import { getUserInfo } from "@/server/user";
import { redirect } from "next/navigation";
import Login from "./Login";

export default async function loginPage() {
  const session = await getUserInfo();
  console.log("seesion", session);
    if (session) {
    redirect("/chat");
  }
  return <Login />
}