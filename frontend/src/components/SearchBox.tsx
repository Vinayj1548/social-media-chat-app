"use client";

import {
  useEffect,
  useId,
  useMemo,
  useState,
  type KeyboardEvent,
} from "react";

import { socket } from "@/lib/socket/socket";

interface User {
  _id: string;
  username: string;
  email?: string;
}

interface SearchBoxProps {
  onSelectUser: (user: User) => void;
}

const SKELETON_ROWS = 3;
const MAX_STAGGER_ROWS = 8;

export default function SearchBox({ onSelectUser }: SearchBoxProps) {
  const [searchTerm, setSearchTerm] = useState("");
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [activeIndex, setActiveIndex] = useState(-1);
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(false);
  const [unreadMessages, setUnreadMessages] = useState<Record<string, number>>(
    {},
  );

  const listId = useId();
  const optionId = (index: number) => `${listId}-option-${index}`;

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
    const handleReceiveMessage = ({ senderID }: { senderID: string }) => {
      setUnreadMessages((prev) => ({
        ...prev,
        [senderID]: (prev[senderID] ?? 0) + 1,
      }));
    };

    socket.on("receiveMessage", handleReceiveMessage);

    return () => {
      socket.off("receiveMessage", handleReceiveMessage);
    };
  }, []);

  const filteredUsers = useMemo(() => {
    const query = searchTerm.trim().toLowerCase();

    if (query === "") {
      return users;
    }

    return users.filter((user) => user.username?.toLowerCase().includes(query));
  }, [users, searchTerm]);

  const showList = showSuggestions && !loading && filteredUsers.length > 0;
  const activeUser = showList ? filteredUsers[activeIndex] : undefined;

  const handleUserClick = (user: User) => {
    setSearchTerm(user.username);
    setShowSuggestions(false);
    setActiveIndex(-1);

    onSelectUser(user);

    setUnreadMessages((prev) => ({
      ...prev,
      [user._id]: 0,
    }));
  };

  const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    const count = filteredUsers.length;

    switch (e.key) {
      case "ArrowDown":
        if (count === 0) return;
        e.preventDefault();
        setShowSuggestions(true);
        setActiveIndex((i) => (i + 1) % count);
        break;

      case "ArrowUp":
        if (count === 0) return;
        e.preventDefault();
        setShowSuggestions(true);
        setActiveIndex((i) => (i <= 0 ? count - 1 : i - 1));
        break;

      case "Enter":
        if (activeUser) {
          e.preventDefault();
          handleUserClick(activeUser);
        }
        break;

      case "Escape":
        setShowSuggestions(false);
        setActiveIndex(-1);
        break;
    }
  };

  return (
    <div className="group relative w-full max-w-md">
      <svg
        aria-hidden="true"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth={2}
        strokeLinecap="round"
        className="pointer-events-none absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-white/50 transition-colors duration-300 group-focus-within:text-[#3BBFA7]"
      >
        <circle cx="11" cy="11" r="7" />
        <path d="m20 20-3.5-3.5" />
      </svg>

      <input
        type="text"
        role="combobox"
        aria-label="Search friends"
        aria-autocomplete="list"
        aria-expanded={showList}
        aria-controls={listId}
        aria-activedescendant={activeUser ? optionId(activeIndex) : undefined}
        placeholder="Search friends..."
        value={searchTerm}
        onChange={(e) => {
          setSearchTerm(e.target.value);
          setActiveIndex(-1);
          setShowSuggestions(true);
        }}
        onFocus={() => setShowSuggestions(true)}
        onBlur={() => setShowSuggestions(false)}
        onKeyDown={handleKeyDown}
        className="w-full rounded-2xl bg-[#61568C] py-3.5 pl-11 pr-4 text-base text-white shadow-lg shadow-[#2b2550]/25 outline-none transition-all duration-300 ease-out placeholder:text-white/65 focus:-translate-y-0.5 focus:bg-[#6c61a0] focus:shadow-[0_0_0_4px_rgba(59,191,167,0.28),0_14px_30px_-10px_rgba(43,37,80,0.7)] motion-reduce:transition-none motion-reduce:focus:translate-y-0"
      />

      <div
        className={`absolute left-0 right-0 top-full z-50 mt-2 origin-top overflow-hidden rounded-2xl border border-[#7769ab] bg-[#61568C] shadow-2xl transition-all duration-200 ease-out motion-reduce:transition-none ${
          showSuggestions
            ? "visible scale-100 opacity-100"
            : "invisible scale-95 opacity-0"
        }`}
      >
        {loading ? (
          <div role="status" className="p-3">
            <span className="sr-only">Loading friends</span>
            <ul aria-hidden="true" className="space-y-2">
              {Array.from({ length: SKELETON_ROWS }, (_, i) => (
                <li
                  key={i}
                  className="flex items-center gap-3 px-2 py-2.5 motion-safe:animate-pulse"
                >
                  <span className="h-9 w-9 rounded-full bg-white/15" />
                  <span className="h-3 w-2/3 rounded-full bg-white/15" />
                </li>
              ))}
            </ul>
          </div>
        ) : filteredUsers.length > 0 ? (
          <ul
            id={listId}
            role="listbox"
            aria-label="Friends"
            onMouseDown={(e) => e.preventDefault()}
            className="max-h-72 overflow-y-auto p-2"
          >
            {filteredUsers.map((user, index) => {
              const unread = unreadMessages[user._id] ?? 0;
              const isActive = index === activeIndex;

              return (
                <li
                  key={user._id}
                  id={optionId(index)}
                  role="option"
                  aria-selected={isActive}
                  onClick={() => handleUserClick(user)}
                  onMouseEnter={() => setActiveIndex(index)}
                  className={`cursor-pointer rounded-xl transition-colors duration-150 motion-reduce:transition-none ${
                    isActive ? "bg-[#7769ab]" : ""
                  }`}
                >
                  <div
                    style={{
                      transitionDelay: showSuggestions
                        ? `${Math.min(index, MAX_STAGGER_ROWS) * 40}ms`
                        : "0ms",
                    }}
                    className={`flex items-center gap-3 px-3 py-2.5 text-white transition-all duration-200 ease-out motion-reduce:translate-y-0 motion-reduce:transition-none ${
                      showSuggestions
                        ? "translate-y-0 opacity-100"
                        : "-translate-y-1 opacity-0"
                    }`}
                  >
                    <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-[#3BBFA7]/20 text-sm font-semibold text-[#9EEBDB]">
                      {user.username?.charAt(0).toUpperCase() || "?"}
                    </span>

                    <span className="min-w-0 flex-1 truncate font-medium">
                      {user.username || "Unnamed User"}
                    </span>

                    {unread > 0 && (
                      <span className="flex h-6 min-w-[1.5rem] items-center justify-center rounded-full bg-[#3BBFA7] px-1.5 text-xs font-bold tabular-nums text-[#1f1a3d]">
                        {unread > 99 ? "99+" : unread}
                      </span>
                    )}
                  </div>
                </li>
              );
            })}
          </ul>
        ) : (
          <p className="px-4 py-6 text-center text-sm text-white/75">
            {users.length === 0
              ? "No friends yet. Add someone to start a chat."
              : `No friends match “${searchTerm.trim()}”.`}
          </p>
        )}
      </div>
    </div>
  );
}