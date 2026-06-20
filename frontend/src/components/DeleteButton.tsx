"use client";

import { useContext, useState } from "react";
import { useRouter } from "next/navigation";
import Modal from "react-bootstrap/Modal";
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

  const handleClose = () => setShow(false);

  const handleShow = () => setShow(true);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    setFormData((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  };

  const deleteUser = async () => {
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
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.message || "Failed to delete account"
        );
      }

      localStorage.clear();

      logout();

      toast.success("Account deleted successfully!");

      setTimeout(() => {
        router.push("/signup");
      }, 1000);
    } catch (error) {
      console.error("Delete Error:", error);

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
    <>
      <ToastContainer
        position="bottom-right"
        theme="dark"
      />

      <button
        onClick={handleShow}
        className="px-6 py-2 text-2xl font-semibold text-white duration-300 hover:underline"
      >
        Delete Account
      </button>

      <Modal
        show={show}
        onHide={handleClose}
        centered
      >
        <Modal.Header closeButton>
          <Modal.Title>
            Confirm Account Deletion
          </Modal.Title>
        </Modal.Header>

        <Modal.Body>
          <p className="mb-2">
            Enter Username
          </p>

          <input
            name="username"
            type="text"
            value={formData.username}
            onChange={handleChange}
            className="mb-4 w-full rounded-lg border p-2"
            placeholder="Username"
          />

          <p className="mb-2">
            Enter Password
          </p>

          <input
            name="password"
            type="password"
            value={formData.password}
            onChange={handleChange}
            className="w-full rounded-lg border p-2"
            placeholder="Password"
          />
        </Modal.Body>

        <Modal.Footer>
          <button
            onClick={handleClose}
            className="rounded-lg bg-gray-300 px-4 py-2"
          >
            Close
          </button>

          <button
            disabled={loading}
            onClick={() => {
              handleClose();
              deleteUser();
            }}
            className="rounded-lg bg-red-500 px-4 py-2 text-white disabled:opacity-50"
          >
            {loading
              ? "Deleting..."
              : "Delete"}
          </button>
        </Modal.Footer>
      </Modal>
    </>
  );
}