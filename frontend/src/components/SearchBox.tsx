"use client";

import { useState, useEffect } from "react";
import { socket } from "@/lib/socket/socket";

interface User {
  _id: string;
  username: string;
  email?: string;
}

interface SearchBoxProps {
  onSelectUser: (user: User) => void;
}

export default function SearchBox({
  onSelectUser,
}: SearchBoxProps) {
  const [searchTerm, setSearchTerm] =
    useState<string>("");

  const [showSuggestions, setShowSuggestions] =
    useState<boolean>(false);

  const [users, setUsers] = useState<User[]>([]);

  const [unreadMessages, setUnreadMessages] =
    useState<Record<string, number>>({});

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const response = await fetch(
          `${process.env.NEXT_PUBLIC_API_URL}/users`
        );

        const data: User[] =
          await response.json();

        setUsers(data);
      } catch (err) {
        console.error(
          "Error fetching users:",
          err
        );
      }
    };

    fetchUsers();
  }, []);

  useEffect(() => {
    const handleReceiveMessage = (
      msgData: {
        senderID: string;
      }
    ) => {
      const { senderID } = msgData;

      setUnreadMessages((prev) => ({
        ...prev,
        [senderID]:
          (prev[senderID] || 0) + 1,
      }));
    };

    socket.on(
      "receiveMessage",
      handleReceiveMessage
    );

    return () => {
      socket.off(
        "receiveMessage",
        handleReceiveMessage
      );
    };
  }, []);

  const handleUserClick = (
    user: User
  ) => {
    setSearchTerm(user.username);

    setShowSuggestions(false);

    onSelectUser(user);

    setUnreadMessages((prev) => ({
      ...prev,
      [user._id]: 0,
    }));
  };

  const filteredUsers =
    searchTerm.trim() === ""
      ? users
      : users.filter((user) =>
          user.username
            ?.toLowerCase()
            .includes(
              searchTerm.toLowerCase()
            )
        );

  return (
    <div className="relative mx-auto w-full">
      <input
        type="text"
        placeholder="Search friends..."
        value={searchTerm}
        onChange={(e) =>
          setSearchTerm(e.target.value)
        }
        onFocus={() =>
          setShowSuggestions(true)
        }
        onBlur={() =>
          setTimeout(
            () =>
              setShowSuggestions(false),
            100
          )
        }
        className="w-50 text-2xl p-8 bg-[#61568C] placeholder:text-2xl text-white rounded-4 shadow-md focus:outline-none"
      />

      {showSuggestions &&
      filteredUsers.length > 0 ? (
        <ul className="absolute h-fit text-start text-2xl left-0 right-0 mt-1 bg-[#61568C] rounded-3 text-white shadow-lg overflow-auto w-50">
          {filteredUsers.map((user) => (
            <li
              key={user._id}
              onClick={() =>
                handleUserClick(user)
              }
              className="p-3 hover:bg-[#7769abbd] hover:text-white cursor-pointer flex items-center justify-between mr-3 transition"
            >
              <span>
                {user.username ||
                  "Unnamed User"}
              </span>

              {unreadMessages[user._id] >
                0 && (
                <span className="bg-green-400 text-white h-10 w-10 rounded-full flex items-center justify-center font-bold animate-pulse">
                  {
                    unreadMessages[
                      user._id
                    ]
                  }
                </span>
              )}
            </li>
          ))}
        </ul>
      ) : null}
    </div>
  );
}