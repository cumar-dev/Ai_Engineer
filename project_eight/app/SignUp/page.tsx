"use client";
import { signUp } from "@/server/user";
import { useRouter } from "next/navigation";
import React, { useState } from "react";
import { useForm } from "react-hook-form";
type SignUpFormData = {
  name: string;
  email: string;
  password: string;
};
const SignUp = () => {
  const { register, handleSubmit, reset } = useForm<SignUpFormData>();
  const [error, setError] = useState("");
  const router = useRouter();
  const onSubmit = async (data: SignUpFormData) => {
    try {
      setError("");
      await signUp(data.name.trim(), data.email.trim(), data.password);
      console.log(signUp);
      alert("user created successfully");
      reset();
      router.push("/SignIn");
    } catch (error: unknown) {
      setError(error instanceof Error ? error.message : "Something went wrong");
    }
  };
  return (
    <>
      <div className="flex justify-center items-center h-screen flex-col">
        <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4">
          <input
            type="text"
            placeholder="name"
            className="border border-gray-300 rounded-md p-2"
            {...register("name", { required: true })}
          />
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
          <button
            type="submit"
            className="bg-rose-500 text-white rounded-md p-2"
          >
            Sign Up
          </button>
        </form>
      </div>
    </>
  );
};

export default SignUp;
