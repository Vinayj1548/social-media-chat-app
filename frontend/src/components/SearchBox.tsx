"use client";

import {
  useState,
  useEffect,
  useMemo,
} from "react";

import { socket } from "@/lib/socket/socket";

interface User {
  _id: string;
  username: string;
  email?: string;
}

interface SearchBoxProps {
  onSelectUser: (
    user: User
  ) => void;
}

export default function SearchBox({
  onSelectUser,
}: SearchBoxProps) {
  const [searchTerm, setSearchTerm] =
    useState("");

  const [showSuggestions, setShowSuggestions] =
    useState(false);

  const [users, setUsers] =
    useState<User[]>([]);

  const [loading, setLoading] =
    useState(false);

  const [unreadMessages, setUnreadMessages] =
    useState<
      Record<string, number>
    >({});

  useEffect(() => {
    let mounted = true;

    const fetchUsers =
      async () => {
        try {
          setLoading(true);

          const response =
            await fetch(
              `${process.env.NEXT_PUBLIC_API_URL}/users`
            );

          const data =
            await response.json();

          if (
            !response.ok
          ) {
            throw new Error(
              data.message ||
                "Failed to fetch users"
            );
          }

          if (
            mounted
          ) {
            setUsers(data);
          }
        } catch (error) {
          console.error(
            "Fetch Users Error:",
            error
          );
        } finally {
          if (
            mounted
          ) {
            setLoading(
              false
            );
          }
        }
      };

    fetchUsers();

    return () => {
      mounted = false;
    };
  }, []);

  useEffect(() => {
    const handleReceiveMessage =
      (msgData: {
        senderID: string;
      }) => {
        const {
          senderID,
        } = msgData;

        setUnreadMessages(
          (
            prev
          ) => ({
            ...prev,
            [senderID]:
              (
                prev[
                  senderID
                ] || 0
              ) + 1,
          })
        );
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

  const handleUserClick =
    (
      user: User
    ) => {
      setSearchTerm(
        user.username
      );

      setShowSuggestions(
        false
      );

      onSelectUser(
        user
      );

      setUnreadMessages(
        (
          prev
        ) => ({
          ...prev,
          [user._id]:
            0,
        })
      );
    };

  const filteredUsers =
    useMemo(() => {
      if (
        searchTerm.trim() ===
        ""
      ) {
        return users;
      }

      return users.filter(
        (
          user
        ) =>
          user.username
            ?.toLowerCase()
            .includes(
              searchTerm.toLowerCase()
            )
      );
    }, [
      users,
      searchTerm,
    ]);

  return (
    <div className="relative mx-auto w-full">
      <input
        type="text"
        placeholder="Search friends..."
        value={
          searchTerm
        }
        onChange={(
          e
        ) =>
          setSearchTerm(
            e.target.value
          )
        }
        onFocus={() =>
          setShowSuggestions(
            true
          )
        }
        onBlur={() =>
          setTimeout(
            () =>
              setShowSuggestions(
                false
              ),
            100
          )
        }
        className="w-50 rounded-4 bg-[#61568C] p-8 text-2xl text-white shadow-md placeholder:text-2xl focus:outline-none"
      />

      {loading && (
        <div className="absolute mt-2 text-white">
          Loading...
        </div>
      )}

      {showSuggestions &&
      filteredUsers.length >
        0 ? (
        <ul className="absolute left-0 right-0 mt-1 h-fit w-50 overflow-auto rounded-3 bg-[#61568C] text-start text-2xl text-white shadow-lg">
          {filteredUsers.map(
            (
              user
            ) => (
              <li
                key={
                  user._id
                }
                onClick={() =>
                  handleUserClick(
                    user
                  )
                }
                className="mr-3 flex cursor-pointer items-center justify-between p-3 transition hover:bg-[#7769abbd]"
              >
                <span>
                  {user.username ||
                    "Unnamed User"}
                </span>

                {unreadMessages[
                  user._id
                ] >
                  0 && (
                  <span className="flex h-10 w-10 animate-pulse items-center justify-center rounded-full bg-green-400 font-bold text-white">
                    {
                      unreadMessages[
                        user
                          ._id
                      ]
                    }
                  </span>
                )}
              </li>
            )
          )}
        </ul>
      ) : null}
    </div>
  );
}