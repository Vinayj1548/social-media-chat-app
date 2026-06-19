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

  const [show, setShow] =
    useState(false);

  const [formData, setFormData] =
    useState({
      username: "",
      password: "",
    });

  const handleClose = () =>
    setShow(false);

  const handleShow = () =>
    setShow(true);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    setFormData((prev) => ({
      ...prev,
      [e.target.name]:
        e.target.value,
    }));
  };

  const deleteUser = async () => {
    try {
      const response =
        await fetch(
          `${process.env.NEXT_PUBLIC_API_URL}/auth/delete`,
          {
            method: "DELETE",
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

      if (response.ok) {
        localStorage.clear();

        logout();

        toast.success(
          "Account deleted successfully!"
        );

        setTimeout(() => {
          router.push("/signup");
        }, 1000);
      } else {
        toast.error(
          data.message ||
            "Failed to delete account"
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
    <>
      <button
        onClick={handleShow}
        className="px-6 py-2 text-2xl text-white font-semibold duration-300 hover:underline"
      >
        Delete Account
      </button>

      <Modal
        show={show}
        onHide={handleClose}
      >
        <ToastContainer />

        <Modal.Header>
          <Modal.Title>
            Confirm Deletion
          </Modal.Title>
        </Modal.Header>

        <Modal.Body>
          <p>
            Enter username:
          </p>

          <input
            name="username"
            type="text"
            value={
              formData.username
            }
            onChange={
              handleChange
            }
            className="w-full mb-4 rounded-lg p-2"
          />

          <p>
            Enter password:
          </p>

          <input
            name="password"
            type="password"
            value={
              formData.password
            }
            onChange={
              handleChange
            }
            className="w-full rounded-lg p-2"
          />
        </Modal.Body>

        <Modal.Footer>
          <button
            onClick={
              handleClose
            }
          >
            Close
          </button>

          <button
            onClick={() => {
              handleClose();
              deleteUser();
            }}
          >
            Delete
          </button>
        </Modal.Footer>
      </Modal>
    </>
  );
}