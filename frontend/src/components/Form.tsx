"use client";

import { useState, useContext } from "react";
import { useRouter } from "next/navigation";
import { ToastContainer, toast } from "react-toastify";
import { AuthContext } from "@/context/AuthContext";

export default function Form() {
  const router = useRouter();

  const auth = useContext(AuthContext);

  if (!auth) {
    return null;
  }

  const { login, isAuthenticated } =
    auth;

  const [formData, setFormData] =
    useState({
      username: "",
      email: "",
      password: "",
    });

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    setFormData((prev) => ({
      ...prev,
      [e.target.name]:
        e.target.value,
    }));
  };

  const handleSubmit = async (
    e: React.FormEvent<HTMLFormElement>
  ) => {
    e.preventDefault();

    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/auth/register`,
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
          "Registration Successful!"
        );

        setTimeout(() => {
          router.push("/chat");
        }, 1000);
      } else {
        toast.error(
          data.message ||
            "Registration failed"
        );
      }
    } catch (error) {
      console.error(error);

      toast.error(
        "Something went wrong"
      );
    }
  };

  return (
    <div className="flex justify-center items-center">
      <ToastContainer />

      {!isAuthenticated && (
        <div className="bg-[#5C4F82] p-15 rounded-5 w-130">
          <h2 className="text-2xl font-semibold text-center text-white mb-4">
            Register
          </h2>

          <form
            onSubmit={handleSubmit}
            className="space-y-4"
          >
            <div>
              <label className="block text-sm font-medium text-white">
                Username
              </label>

              <input
                type="text"
                name="username"
                value={
                  formData.username
                }
                onChange={
                  handleChange
                }
                required
                placeholder="Enter your username"
                className="text-white mt-1 block w-full px-4 py-2 border border-gray-300 rounded-lg"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-white">
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
                required
                placeholder="Enter your email"
                className="text-white mt-1 block w-full px-4 py-2 border border-gray-300 rounded-lg"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-white">
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
                required
                placeholder="Enter your password"
                className="text-white mt-1 block w-full px-4 py-2 border border-gray-300 rounded-lg"
              />
            </div>

            <button
              type="submit"
              className="w-full mt-3 bg-[#3BBFA7] hover:bg-[rgb(80,164,149)] text-white font-semibold py-2 px-4 rounded-md hover:scale-105 transition duration-200"
            >
              Register
            </button>
          </form>
        </div>
      )}
    </div>
  );
}