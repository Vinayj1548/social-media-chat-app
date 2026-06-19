"use client";

import {
  useState,
  useContext,
  ChangeEvent,
  FormEvent,
} from "react";
import { useRouter } from "next/navigation";
import {
  ToastContainer,
  toast,
} from "react-toastify";

import { AuthContext } from "@/context/AuthContext";

export default function LoginForm() {
  const router = useRouter();

  const auth = useContext(AuthContext);

  if (!auth) return null;

  const { login } = auth;

  const [formData, setFormData] =
    useState({
      email: "",
      password: "",
    });

  const [loading, setLoading] =
    useState(false);

  const handleChange = (
    e: ChangeEvent<HTMLInputElement>
  ) => {
    setFormData((prev) => ({
      ...prev,
      [e.target.name]:
        e.target.value,
    }));
  };

  const handleSubmit = async (
    e: FormEvent<HTMLFormElement>
  ) => {
    e.preventDefault();

    setLoading(true);

    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/auth/login`,
        {
          method: "POST",
          headers: {
            "Content-Type":
              "application/json",
          },
          body: JSON.stringify(
            formData
          ),
        }
      );

      const data =
        await response.json();

      if (data.user?.id) {
        login(data.user.id);

        localStorage.setItem(
          "username",
          data.user.username
        );

        localStorage.setItem(
          "userID",
          data.user.id
        );

        if (data.token) {
          localStorage.setItem(
            "token",
            data.token
          );
        }

        toast.success(
          "Login successful!"
        );

        setTimeout(() => {
          router.push("/chat");
        }, 1000);
      } else {
        toast.error(
          "Invalid credentials"
        );
      }
    } catch (error) {
      console.error(
        "Login Error:",
        error
      );

      toast.error(
        "Server error. Try again later."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <ToastContainer
        position="bottom-right"
        theme="dark"
      />

      <div className="flex items-center justify-center px-4 py-10">
        <div className="w-full max-w-md rounded-3xl bg-card p-8 shadow-2xl">
          <h1 className="mb-8 text-center text-5xl font-bold text-white">
            Login
          </h1>

          <form
            onSubmit={handleSubmit}
            className="space-y-5"
          >
            <div>
              <label className="mb-2 block text-sm font-medium text-white">
                Email
              </label>

              <input
                type="email"
                name="email"
                value={
                  formData.email
                }
                onChange={
                  handleChange
                }
                placeholder="Enter your email"
                required
                className="w-full rounded-2xl border border-white/10 bg-primary px-5 py-4 text-white placeholder:text-gray-300 focus:border-accent transition-all"
              />
            </div>

            <div>
              <label className="mb-2 block text-sm font-medium text-white">
                Password
              </label>

              <input
                type="password"
                name="password"
                value={
                  formData.password
                }
                onChange={
                  handleChange
                }
                placeholder="Enter your password"
                required
                className="w-full rounded-2xl border border-white/10 bg-primary px-5 py-4 text-white placeholder:text-gray-300 focus:border-accent transition-all"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="mt-2 w-full rounded-2xl bg-accent py-4 text-lg font-semibold text-white transition-all duration-300 hover:scale-[1.02] hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-70"
            >
              {loading
                ? "Logging in..."
                : "Login"}
            </button>
          </form>
        </div>
      </div>
    </>
  );
}