"use client";

import { useState, useContext } from "react";
import { useRouter } from "next/navigation";
import { ToastContainer, toast } from "react-toastify";
import { AuthContext } from "@/context/AuthContext";

export default function Form() {
  const router = useRouter();

  const auth = useContext(AuthContext);

  if (!auth) return null;

  const { login, isAuthenticated } = auth;

  const [loading, setLoading] = useState(false);

  const [formData, setFormData] = useState({
    username: "",
    email: "",
    password: "",
  });

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    setFormData((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  };

  const handleSubmit = async (
    e: React.FormEvent<HTMLFormElement>
  ) => {
    e.preventDefault();

    try {
      setLoading(true);

      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/auth/register`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(formData),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.message || "Registration failed"
        );
      }

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

        if (data.user?.token) {
          localStorage.setItem(
            "token",
            data.user.token
          );
        }

        toast.success(
          "Registration Successful!"
        );

        setTimeout(() => {
          router.push("/chat");
        }, 1000);
      }
    } catch (error) {
      console.error(
        "Registration Error:",
        error
      );

      toast.error(
        error instanceof Error
          ? error.message
          : "Something went wrong"
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex items-center justify-center">
      <ToastContainer
        position="bottom-right"
        theme="dark"
      />

      {!isAuthenticated && (
        <div className="w-130 rounded-3xl bg-[#5C4F82] p-10 shadow-2xl">
          <h2 className="mb-6 text-center text-3xl font-bold text-white">
            Register
          </h2>

          <form
            onSubmit={handleSubmit}
            className="space-y-5"
          >
            <div>
              <label className="mb-2 block text-sm font-medium text-white">
                Username
              </label>

              <input
                type="text"
                name="username"
                value={formData.username}
                onChange={handleChange}
                required
                placeholder="Enter your username"
                className="mt-1 block w-full rounded-xl border border-white/20 bg-primary px-4 py-3 text-white placeholder:text-gray-300 focus:border-accent focus:outline-none"
              />
            </div>

            <div>
              <label className="mb-2 block text-sm font-medium text-white">
                Email
              </label>

              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                required
                placeholder="Enter your email"
                className="mt-1 block w-full rounded-xl border border-white/20 bg-primary px-4 py-3 text-white placeholder:text-gray-300 focus:border-accent focus:outline-none"
              />
            </div>

            <div>
              <label className="mb-2 block text-sm font-medium text-white">
                Password
              </label>

              <input
                type="password"
                name="password"
                value={formData.password}
                onChange={handleChange}
                required
                placeholder="Enter your password"
                className="mt-1 block w-full rounded-xl border border-white/20 bg-primary px-4 py-3 text-white placeholder:text-gray-300 focus:border-accent focus:outline-none"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full rounded-xl bg-[#3BBFA7] py-3 font-semibold text-white transition-all duration-300 hover:scale-[1.02] hover:bg-[rgb(80,164,149)] disabled:cursor-not-allowed disabled:opacity-70"
            >
              {loading
                ? "Creating Account..."
                : "Register"}
            </button>
          </form>
        </div>
      )}
    </div>
  );
}