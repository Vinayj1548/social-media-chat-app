"use client";

import { useContext, useState } from "react";
import { useRouter } from "next/navigation";
import { ToastContainer, toast } from "react-toastify";
import { AuthContext } from "@/context/AuthContext";

export default function DeleteButton() {
  const auth = useContext(AuthContext);

  if (!auth) return null;

  const { logout } = auth;

  const router = useRouter();

  const [show, setShow] = useState(false);
  const [loading, setLoading] = useState(false);

  const [formData, setFormData] = useState({
    username: "",
    password: "",
  });

  const toggleModal = () => {
    setShow((prev) => !prev);
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;

    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const resetForm = () => {
    setFormData({
      username: "",
      password: "",
    });
  };

  const deleteUser = async () => {
    if (!formData.username.trim() || !formData.password.trim()) {
      toast.error("Please enter username and password");
      return;
    }

    try {
      setLoading(true);

      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/auth/delete`,
        {
          method: "DELETE",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(formData),
        },
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Failed to delete account");
      }

      toast.success("Account deleted successfully!");

      localStorage.clear();

      logout();

      resetForm();

      setTimeout(() => {
        router.replace("/signup");
      }, 1200);
    } catch (error) {
      console.error("Delete Account Error:", error);

      toast.error(
        error instanceof Error ? error.message : "Something went wrong",
      );
    } finally {
      setLoading(false);
      setShow(false);
    }
  };

  return (
    <>
      <ToastContainer position="bottom-right" theme="dark" />

      {/* Button */}

      <button
        onClick={toggleModal}
        className="
          rounded-lg
          border
          border-red-400/30
          px-4
          py-2
          text-sm
          font-medium
          text-red-300
          transition-all
          hover:bg-red-500/10
        "
      >
        Delete Account
      </button>

      {/* Tailwind Modal */}

      {show && (
        <div
          className="
            fixed
            inset-0
            z-50
            flex
            items-center
            justify-center
            bg-black/60
            backdrop-blur-sm
          "
        >
          <div
            className="
              w-full
              max-w-md
              rounded-2xl
              bg-[#5C4F82]
              p-6
              shadow-2xl
            "
          >
            <h2 className="mb-2 text-xl font-bold text-white">
              Delete Account
            </h2>

            <p className="mb-6 text-sm text-gray-300">
              This action cannot be undone.
            </p>

            <div className="space-y-4">
              <input
                name="username"
                type="text"
                value={formData.username}
                onChange={handleChange}
                placeholder="Username"
                className="
                  w-full
                  rounded-xl
                  bg-[#61568C]
                  px-4
                  py-3
                  text-white
                  placeholder:text-gray-400
                  focus:outline-none
                  focus:ring-2
                  focus:ring-[#3BBFA7]
                "
              />

              <input
                name="password"
                type="password"
                value={formData.password}
                onChange={handleChange}
                placeholder="Password"
                className="
                  w-full
                  rounded-xl
                  bg-[#61568C]
                  px-4
                  py-3
                  text-white
                  placeholder:text-gray-400
                  focus:outline-none
                  focus:ring-2
                  focus:ring-[#3BBFA7]
                "
              />
            </div>

            <div className="mt-6 flex justify-end gap-3">
              <button
                onClick={toggleModal}
                disabled={loading}
                className="
                  rounded-lg
                  bg-[#61568C]
                  px-4
                  py-2
                  text-white
                "
              >
                Cancel
              </button>

              <button
                onClick={deleteUser}
                disabled={loading}
                className="
                  rounded-lg
                  bg-red-500
                  px-4
                  py-2
                  font-medium
                  text-white
                  hover:bg-red-600
                  disabled:opacity-50
                "
              >
                {loading ? "Deleting..." : "Delete Account"}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
