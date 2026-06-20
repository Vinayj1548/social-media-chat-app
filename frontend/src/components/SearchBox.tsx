"use client";

import { useState, useEffect, useMemo } from "react";

import { socket } from "@/lib/socket/socket";

interface User {
  _id: string;
  username: string;
  email?: string;
}

interface SearchBoxProps {
  onSelectUser: (user: User) => void;
}

export default function SearchBox({ onSelectUser }: SearchBoxProps) {
  const [searchTerm, setSearchTerm] = useState("");

  const [showSuggestions, setShowSuggestions] = useState(false);

  const [users, setUsers] = useState<User[]>([]);

  const [loading, setLoading] = useState(false);

  const [unreadMessages, setUnreadMessages] = useState<Record<string, number>>(
    {},
  );

  useEffect(() => {
    let mounted = true;

    const fetchUsers = async () => {
      try {
        setLoading(true);

        const response = await fetch(
          `${process.env.NEXT_PUBLIC_API_URL}/users`,
        );

        const data = await response.json();

        if (!response.ok) {
          throw new Error(data.message || "Failed to fetch users");
        }

        if (mounted) {
          setUsers(data);
        }
      } catch (error) {
        console.error("Fetch Users Error:", error);
      } finally {
        if (mounted) {
          setLoading(false);
        }
      }
    };

    fetchUsers();

    return () => {
      mounted = false;
    };
  }, []);

  useEffect(() => {
    const handleReceiveMessage = (msgData: { senderID: string }) => {
      const { senderID } = msgData;

      setUnreadMessages((prev) => ({
        ...prev,
        [senderID]: (prev[senderID] || 0) + 1,
      }));
    };

    socket.on("receiveMessage", handleReceiveMessage);

    return () => {
      socket.off("receiveMessage", handleReceiveMessage);
    };
  }, []);

  const handleUserClick = (user: User) => {
    setSearchTerm(user.username);

    setShowSuggestions(false);

    onSelectUser(user);

    setUnreadMessages((prev) => ({
      ...prev,
      [user._id]: 0,
    }));
  };

  const filteredUsers = useMemo(() => {
    if (searchTerm.trim() === "") {
      return users;
    }

    return users.filter((user) =>
      user.username?.toLowerCase().includes(searchTerm.toLowerCase()),
    );
  }, [users, searchTerm]);

  return (
    <div className="relative w-full max-w-md">
      <input
        type="text"
        placeholder="Search friends..."
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
        onFocus={() => setShowSuggestions(true)}
        onBlur={() => setTimeout(() => setShowSuggestions(false), 100)}
        className="
      w-full
      rounded-xl
      bg-[#61568C]
      px-4
      py-3
      text-base
      text-white
      placeholder:text-gray-300
      shadow-md
      transition-all
      duration-200
      focus:ring-2
      focus:ring-[#3BBFA7]
      focus:outline-none
    "
      />

      {loading && (
        <div className="absolute left-3 top-full mt-2 text-sm text-gray-300">
          Loading...
        </div>
      )}

      {showSuggestions && filteredUsers.length > 0 && (
        <ul
          className="
        absolute
        z-50
        mt-2
        max-h-72
        w-full
        overflow-y-auto
        rounded-xl
        bg-[#61568C]
        shadow-xl
        border
        border-[#7769ab]
      "
        >
          {filteredUsers.map((user) => (
            <li
              key={user._id}
              onClick={() => handleUserClick(user)}
              className="
            flex
            cursor-pointer
            items-center
            justify-between
            px-4
            py-3
            text-white
            transition-colors
            hover:bg-[#7769ab]
          "
            >
              <span className="font-medium">
                {user.username || "Unnamed User"}
              </span>

              {unreadMessages[user._id] > 0 && (
                <span
                  className="
                flex
                h-6
                w-6
                items-center
                justify-center
                rounded-full
                bg-[#3BBFA7]
                text-xs
                font-bold
                text-white
              "
                >
                  {unreadMessages[user._id]}
                </span>
              )}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
