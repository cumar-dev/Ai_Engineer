"use client";
import { googleSignIn, signIn } from "@/server/user";
import { useRouter } from "next/navigation";
import React, { useState } from "react";
import { useForm } from "react-hook-form";

const SignIn = () => {
  const { register, reset, handleSubmit } = useForm();
  const [error, setError] = useState("");
  const [success, setSucess] = useState("");
  const router = useRouter();
  const onSubmit = async (data: any) => {
    try {
      setError("");
      await signIn(data.email.trim(), data.password);
      setSucess("signIn created successfully");
      reset();
      router.push("/dashboard");
    } catch (error: unknown) {
      setError(error instanceof Error ? error.message : "Something went wrong");
    }
  };
  return (
    <>
      <div className="flex justify-center items-center min-h-screen">
        <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4">
          <input
            type="email"
            placeholder="email"
            className="border border-gray-300 rounded-md p-2"
            {...register("email", { required: true })}
          />
          <input
            type="password"
            placeholder="password"
            className="border border-gray-300 rounded-md p-2"
            {...register("password", {
              minLength: {
                value: 2,
                message: "Password must be at least 8 characters",
              },
              required: true,
            })}
          />
          {error && <p className="text-sm text-red-500">{error}</p>}
          {success && <p className="text-sm text-green-500">{error}</p>}
          <button
            type="submit"
            className="bg-rose-500 text-white rounded-md p-2"
          >
            Sign In
          </button>
          <div className="text-center">OR</div>
        </form>

        <form action={googleSignIn}>
          <button
            type="submit"
            className="w-full rounded-md border border-gray-300 p-2"
          >
            Sign in with Google
          </button>
        </form>
      </div>
    </>
  );
};

export default SignIn;
