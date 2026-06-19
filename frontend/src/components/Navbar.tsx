"use client";

import { useState, useEffect, useContext } from "react";
import Image from "next/image";
import Link from "next/link";
import axios from "axios";

import navIcon from "@/assets/chat.png";
import { AuthContext } from "@/context/AuthContext";
import Logout from "@/components/Logout";
import DeleteButton from "@/components/DeleteButton";

export default function Navbar() {
  const auth = useContext(AuthContext);

  if (!auth) return null;

  const { isAuthenticated, logout } = auth;

  const [username, setUsername] =
    useState<string>("");

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const response = await axios.get(
          `${process.env.NEXT_PUBLIC_API_URL}/users`
        );

        const users = response.data;

        const loggedUserID =
          localStorage.getItem("userID");

        const matchedUser = users.find(
          (user: {
            _id: string;
            username: string;
          }) =>
            user._id === loggedUserID
        );

        if (matchedUser) {
          setUsername(
            matchedUser.username
          );
        }
      } catch (error) {
        console.error(
          "Error fetching user:",
          error
        );
      }
    };

    if (isAuthenticated) {
      fetchUser();
    }
  }, [isAuthenticated]);

  const handleDelete = () => {
    console.log("Deleted");
  };

  const handleLogout = () => {
    logout();
  };

  return (
    <nav className="absolute top-0 left-0 text-white h-20 flex items-center justify-between px-6 w-full bg-[#504673da] shadow-sm">
      <h1 className="text-2xl flex items-center">
        <Image
          src={navIcon}
          alt="Chat Icon"
          width={40}
          height={40}
          className="mr-2"
        />
        svapp
      </h1>

      <div className="flex items-center gap-6">
        {isAuthenticated ? (
          <div className="flex items-center gap-6">
            {username ? (
              <span className="text-xl font-semibold">
                Welcome, {username}
              </span>
            ) : (
              <span>No User</span>
            )}

            <Logout
              handleLogout={
                handleLogout
              }
            />

            <DeleteButton
              {...({ deleteAcc: handleDelete } as any)}
            />
          </div>
        ) : (
          <div className="md:flex gap-4">
            <Link href="/login">
              <button className="px-6 py-2 text-white font-semibold hover:underline">
                Login
              </button>
            </Link>

            <Link href="/signup">
              <button className="px-6 py-2 text-white font-semibold hover:underline">
                Signup
              </button>
            </Link>
          </div>
        )}
      </div>
    </nav>
  );
}