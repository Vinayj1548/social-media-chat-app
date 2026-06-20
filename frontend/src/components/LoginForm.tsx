"use client";

import { useState, useContext, ChangeEvent, FormEvent } from "react";

import { useRouter } from "next/navigation";
import { ToastContainer, toast } from "react-toastify";

import { AuthContext } from "@/context/AuthContext";

export default function LoginForm() {
  // debug

  const router = useRouter();

  const auth = useContext(AuthContext);

  if (!auth) return null;

  const { login } = auth;

  const [loading, setLoading] = useState(false);

  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });

  const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
    setFormData((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  };

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    try {
      setLoading(true);

      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/auth/login`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(formData),
        },
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Login failed");
      }

      if (data.user?.id) {
        login(data.user.id);

        localStorage.setItem("username", data.user.username);

        localStorage.setItem("userID", data.user.id);

        if (data.user?.token) {
          localStorage.setItem("token", data.user.token);
        }

        toast.success("Login Successful!");

        setTimeout(() => {
          router.push("/chat");
        }, 1000);
      }
    } catch (error) {
      console.error("Login Error:", error);

      toast.error(
        error instanceof Error
          ? error.message
          : "Server error. Try again later.",
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <ToastContainer position="bottom-right" theme="dark" />

      <div className="flex max-h-[calc(40vh-7rem)] items-center justify-center">
        <div
          className="
        w-full
        max-w-md
        rounded-3xl
        border
        border-white/10
        bg-[#5c4f82]
        p-8
        shadow-2xl
        backdrop-blur-md
      "
        >
          <div className="mb-8 text-center">
            <h1 className="text-4xl font-bold text-white">Welcome Back</h1>

            <p className="mt-2 text-sm text-gray-300">
              Login to continue chatting
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="mb-2 block text-sm font-medium text-gray-200">
                Email
              </label>

              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                placeholder="Enter your email"
                required
                className="
              w-full
              rounded-xl
              border
              border-white/10
              bg-[#61568C]
              px-4
              py-3
              text-white
              placeholder:text-gray-400
              transition-all
              duration-200
              focus:border-[#3BBFA7]
              focus:ring-2
              focus:ring-[#3BBFA7]/30
              focus:outline-none
            "
              />
            </div>

            <div>
              <label className="mb-2 block text-sm font-medium text-gray-200">
                Password
              </label>

              <input
                type="password"
                name="password"
                value={formData.password}
                onChange={handleChange}
                placeholder="Enter your password"
                required
                className="
              w-full
              rounded-xl
              border
              border-white/10
              bg-[#61568C]
              px-4
              py-3
              text-white
              placeholder:text-gray-400
              transition-all
              duration-200
              focus:border-[#3BBFA7]
              focus:ring-2
              focus:ring-[#3BBFA7]/30
              focus:outline-none
            "
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="
            w-full
            rounded-xl
            bg-[#3BBFA7]
            py-3
            text-base
            font-semibold
            text-white
            transition-all
            duration-200
            hover:scale-[1.02]
            hover:shadow-lg
            disabled:cursor-not-allowed
            disabled:opacity-60
          "
            >
              {loading ? "Logging in..." : "Login"}
            </button>
          </form>
        </div>
      </div>
    </>
  );
}
