"use client";
 
import {
  useCallback,
  useContext,
  useEffect,
  useState,
  type ChangeEvent,
  type FormEvent,
  type ReactNode,
} from "react";
import { createPortal } from "react-dom";
import { useRouter } from "next/navigation";
import { ToastContainer, toast } from "react-toastify";
import { AuthContext } from "@/context/AuthContext";
 
const EMPTY_FORM = { username: "", password: "" };
 
// Renders children directly under <body>. `position: fixed` is relative to the
// viewport only when no ancestor has transform, filter, or backdrop-filter, so
// this keeps the overlay centered and full-screen even inside a blurred navbar.
function Portal({ children }: { children: ReactNode }) {
  const [mounted, setMounted] = useState(false);
 
  useEffect(() => {
    setMounted(true);
  }, []);
 
  return mounted ? createPortal(children, document.body) : null;
}
 
export default function DeleteButton() {
  const auth = useContext(AuthContext);
  const router = useRouter();
 
  const [show, setShow] = useState(false);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState(EMPTY_FORM);
 
  const closeModal = useCallback(() => {
    setShow(false);
    setFormData(EMPTY_FORM);
  }, []);
 
  // Close with Escape, unless a request is in flight.
  useEffect(() => {
    if (!show) return;
 
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape" && !loading) {
        closeModal();
      }
    };
 
    document.addEventListener("keydown", handleKeyDown);
 
    return () => {
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [show, loading, closeModal]);
 
  // Stop the page behind the modal from scrolling.
  useEffect(() => {
    if (!show) return;
 
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
 
    return () => {
      document.body.style.overflow = previousOverflow;
    };
  }, [show]);
 
  // All hooks must run above this line. An early return before a hook breaks
  // React's rules of hooks.
  if (!auth) return null;
 
  const { logout } = auth;
 
  const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
 
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };
 
  const deleteUser = async () => {
    if (!formData.username.trim() || !formData.password.trim()) {
      toast.error("Please enter username and password");
      return;
    }
 
    setLoading(true);
 
    try {
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
      closeModal();
 
      setTimeout(() => {
        router.replace("/signup");
      }, 1200);
    } catch (error) {
      console.error("Delete Account Error:", error);
 
      toast.error(
        error instanceof Error ? error.message : "Something went wrong",
      );
 
      // Keep the dialog open so the user can retry. Clear only the password.
      setFormData((prev) => ({ ...prev, password: "" }));
    } finally {
      setLoading(false);
    }
  };
 
  const handleSubmit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    deleteUser();
  };
 
  return (
    <>
      <button
        type="button"
        onClick={() => setShow(true)}
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
 
      <Portal>
        {/* Kept outside the modal condition so the success toast is not lost when the dialog closes. */}
        <ToastContainer position="bottom-right" theme="dark" />
 
        {show && (
          <div
            className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm"
            onClick={(e) => {
              if (e.target === e.currentTarget && !loading) {
                closeModal();
              }
            }}
          >
            <div
              role="dialog"
              aria-modal="true"
              aria-labelledby="delete-account-title"
              className="w-full max-w-md rounded-2xl bg-[#5C4F82] p-6 shadow-2xl"
            >
              <form onSubmit={handleSubmit}>
                <h2
                  id="delete-account-title"
                  className="mb-2 text-xl font-bold text-white"
                >
                  Delete Account
                </h2>
 
                <p className="mb-6 text-sm text-gray-300">
                  This action cannot be undone.
                </p>
 
                <div className="space-y-4">
                  <input
                    name="username"
                    type="text"
                    autoComplete="username"
                    autoFocus
                    value={formData.username}
                    onChange={handleChange}
                    disabled={loading}
                    placeholder="Username"
                    className="w-full rounded-xl bg-[#61568C] px-4 py-3 text-white placeholder:text-gray-400 outline-none focus:ring-2 focus:ring-[#3BBFA7] disabled:opacity-60"
                  />
 
                  <input
                    name="password"
                    type="password"
                    autoComplete="current-password"
                    value={formData.password}
                    onChange={handleChange}
                    disabled={loading}
                    placeholder="Password"
                    className="w-full rounded-xl bg-[#61568C] px-4 py-3 text-white placeholder:text-gray-400 outline-none focus:ring-2 focus:ring-[#3BBFA7] disabled:opacity-60"
                  />
                </div>
 
                <div className="mt-6 flex justify-end gap-3">
                  <button
                    type="button"
                    onClick={closeModal}
                    disabled={loading}
                    className="rounded-lg bg-[#61568C] px-4 py-2 text-white transition hover:brightness-110 disabled:opacity-50"
                  >
                    Cancel
                  </button>
 
                  <button
                    type="submit"
                    disabled={loading}
                    className="rounded-lg bg-red-500 px-4 py-2 font-medium text-white transition hover:bg-red-600 disabled:opacity-50"
                  >
                    {loading ? "Deleting..." : "Delete Account"}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </Portal>
    </>
  );
}
 