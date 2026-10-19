"use server";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { redirect } from "next/navigation";

export async function signUp(name: string, email: string, password: string) {
  const user = await auth.api.signUpEmail({
    body: {
      name,
      email,
      password,
    },
  });
  return user;
}

export async function logIn(email: string, password: string) {
  const user = await auth.api.signInEmail({
    body: {
      email,
      password,
    },
  });
  return user;
}

export async function logOut() {
  await auth.api.signOut({
    headers: await headers(),
  });
  redirect("/Register");
}

export async function getUserInfo() {
  const session = auth.api.getSession({
    headers: await headers(),
  });

  return session;
}

export async function loginWithGoogle(): Promise<void> {
  const user = await auth.api.signInSocial({
    body: {
      provider: "google",
      callbackURL: "/chat",
    },
    headers: await headers(),
  });

   if (user.url) {
    redirect(user.url);
  }
}
