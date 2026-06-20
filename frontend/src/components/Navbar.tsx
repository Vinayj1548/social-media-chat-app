"use client";

import {
  useState,
  useEffect,
  useContext,
} from "react";

import Image from "next/image";
import Link from "next/link";

import navIcon from "@/assets/chat.png";
import { AuthContext } from "@/context/AuthContext";
import Logout from "@/components/Logout";
import DeleteButton from "@/components/DeleteButton";

export default function Navbar() {
  const auth = useContext(AuthContext);

  if (!auth) return null;

  const { isAuthenticated, logout } =
    auth;

  const [username, setUsername] =
    useState("");

  useEffect(() => {
    let mounted = true;

    const fetchUser = async () => {
      try {
        const loggedUserID =
          localStorage.getItem(
            "userID"
          );

        if (!loggedUserID) return;

        const response =
          await fetch(
            `${process.env.NEXT_PUBLIC_API_URL}/users`
          );

        const data =
          await response.json();

        if (!response.ok) {
          throw new Error(
            data.message ||
              "Failed to fetch users"
          );
        }

        const matchedUser =
          data.find(
            (user: {
              _id: string;
              username: string;
            }) =>
              user._id ===
              loggedUserID
          );

        if (
          mounted &&
          matchedUser
        ) {
          setUsername(
            matchedUser.username
          );
        }
      } catch (error) {
        console.error(
          "User Fetch Error:",
          error
        );
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
    <nav className="absolute top-0 left-0 flex h-20 w-full items-center justify-between bg-[#504673da] px-6 text-white shadow-sm">
      <h1 className="flex items-center text-2xl font-semibold">
        <Image
          src={navIcon}
          alt="Chat Icon"
          width={40}
          height={40}
          className="mr-2"
          priority
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
              <span className="text-gray-300">
                Loading...
              </span>
            )}

            <Logout
              handleLogout={
                handleLogout
              }
            />

            <DeleteButton />
          </div>
        ) : (
          <div className="flex gap-4">
            <Link href="/login">
              <button className="px-6 py-2 font-semibold transition hover:underline">
                Login
              </button>
            </Link>

            <Link href="/signup">
              <button className="px-6 py-2 font-semibold transition hover:underline">
                Signup
              </button>
            </Link>
          </div>
        )}
      </div>
    </nav>
  );
}