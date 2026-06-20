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

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
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
        },
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Registration failed");
      }

      if (data.user?.id) {
        login(data.user.id);

        localStorage.setItem("username", data.user.username);

        localStorage.setItem("userID", data.user.id);

        if (data.user?.token) {
          localStorage.setItem("token", data.user.token);
        }

        toast.success("Registration Successful!");

        setTimeout(() => {
          router.push("/chat");
        }, 1000);
      }
    } catch (error) {
      console.error("Registration Error:", error);

      toast.error(
        error instanceof Error ? error.message : "Something went wrong",
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex h-50vw items-center justify-center">
      <ToastContainer position="bottom-right" theme="dark" />

      {!isAuthenticated && (
        <div
          className="
        w-full
        height-auto
        rounded-3xl
        border
        border-white/10
        bg-[#5C4F82]
        p-8
        shadow-2xl
        backdrop-blur-md
      "
        >
          <div className="mb-8 text-center">
            <h2 className="text-4xl font-bold text-white">Create Account</h2>

            <p className="mt-2 text-sm text-gray-300">
              Join and start chatting instantly
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="mb-2 block text-sm font-medium text-gray-200">
                Username
              </label>

              <input
                type="text"
                name="username"
                value={formData.username}
                onChange={handleChange}
                required
                placeholder="Enter your username"
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
                Email
              </label>

              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                required
                placeholder="Enter your email"
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
                required
                placeholder="Enter your password"
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
              {loading ? "Creating Account..." : "Create Account"}
            </button>
          </form>
        </div>
      )}
    </div>
  );
}
