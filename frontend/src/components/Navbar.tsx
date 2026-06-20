"use client";

import { useState, useEffect, useContext } from "react";

import Image from "next/image";
import Link from "next/link";

import navIcon from "@/assets/chat.png";
import { AuthContext } from "@/context/AuthContext";
import Logout from "@/components/Logout";
import DeleteButton from "@/components/DeleteButton";

export default function Navbar() {
  const auth = useContext(AuthContext);

  if (!auth) return null;

  const { isAuthenticated, logout } = auth;

  const [username, setUsername] = useState("");

  useEffect(() => {
    let mounted = true;

    const fetchUser = async () => {
      try {
        const loggedUserID = localStorage.getItem("userID");

        if (!loggedUserID) return;

        const response = await fetch(
          `${process.env.NEXT_PUBLIC_API_URL}/users`,
        );

        const data = await response.json();

        if (!response.ok) {
          throw new Error(data.message || "Failed to fetch users");
        }

        const matchedUser = data.find(
          (user: { _id: string; username: string }) =>
            user._id === loggedUserID,
        );

        if (mounted && matchedUser) {
          setUsername(matchedUser.username);
        }
      } catch (error) {
        console.error("User Fetch Error:", error);
      }
    };

    if (isAuthenticated) {
      fetchUser();
    }

    return () => {
      mounted = false;
    };
  }, [isAuthenticated]);

  const handleLogout = () => {
    logout();
  };

  return (
    <nav
      className="
    fixed
    top-0
    z-50
    flex
    h-16
    w-full
    items-center
    justify-between
    border-b
    border-[#61568C]
    bg-[#504673]/95
    px-6
    text-white
    backdrop-blur-md
  "
    >
      <Link href="/" className="flex items-center gap-2">
        <Image src={navIcon} alt="Chat Icon" width={38} height={38} priority />

        <span className="text-3xl font-bold tracking-tight">svapp</span>
      </Link>

      {isAuthenticated ? (
        <div className="flex items-center gap-4">
          {username ? (
            <div
              className="
            hidden
            rounded-full
            bg-[#61568C]
            px-4
            py-2
            text-sm
            font-medium
            md:flex
          "
            >
              👋 {username}
            </div>
          ) : (
            <span className="text-sm text-gray-300">Loading...</span>
          )}

          <Logout handleLogout={handleLogout} />

          <DeleteButton />
        </div>
      ) : (
        <div className="flex items-center gap-3">
          <Link href="/login">
            <button
              className="
            rounded-lg
            px-4
            py-2
            text-sm
            font-medium
            transition
            hover:bg-[#61568C]
          "
            >
              Login
            </button>
          </Link>

          <Link href="/signup">
            <button
              className="
            rounded-lg
            bg-[#3BBFA7]
            px-4
            py-2
            text-sm
            font-semibold
            text-white
            transition-all
            hover:scale-105
          "
            >
              Signup
            </button>
          </Link>
        </div>
      )}
    </nav>
  );
}
