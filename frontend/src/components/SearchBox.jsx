import { useState, useEffect } from "react";
import { socket } from "../socket"; // Import socket

const SearchBox = ({ onSelectUser }) => {
  const [searchTerm, setSearchTerm] = useState("");
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [users, setUsers] = useState([]);
  const [unreadMessages, setUnreadMessages] = useState({}); // Store unread messages

  const currentUserID = localStorage.getItem("user"); // Get logged-in user ID

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const response = await fetch("http://localhost:5000/api/users");
        const data = await response.json();
        setUsers(data);
      } catch (err) {
        console.log("Error", err);
      }
    };

    fetchUsers();
  }, []);

  useEffect(() => {
    socket.on("receiveMessage", (msgData) => {
      const { senderID } = msgData;

      // If message is from another user and not currently selected, increase count
      setUnreadMessages((prev) => ({
        ...prev,
        [senderID]: (prev[senderID] || 0) + 1,
      }));
    });

    return () => socket.off("receiveMessage");
  }, []);

  const handleUserClick = (user) => {
    setSearchTerm(user.username);
    setShowSuggestions(false);
    onSelectUser(user);

    // Reset unread message count for selected user
    setUnreadMessages((prev) => ({
      ...prev,
      [user._id]: 0,
    }));
  };

  const filteredUsers =
    searchTerm.trim() === ""
      ? users
      : users.filter((user) =>
          user?.username?.toLowerCase().includes(searchTerm.toLowerCase())
        );

  return (
    <div className="relative mx-auto w-full">
      <input
        type="text"
        placeholder="Search friends..."
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
        onFocus={() => setShowSuggestions(true)}
        onBlur={() => setTimeout(() => setShowSuggestions(false), 100)}
        className="w-50 text-2xl p-8 bg-[#61568C] placeholder:text-2xl text-white rounded-4 shadow-md focus:outline-none"
      />

      {showSuggestions && filteredUsers.length > 0 ? (
        <ul className="absolute h-fit text-start text-2xl left-0 right-0 mt-1 bg-[#61568C] rounded-3 text-white shadow-lg overflow-auto w-50">
          {filteredUsers.map((user, index) => (
            <li
              key={index}
              onClick={() => handleUserClick(user)}
              className="p-3 hover:bg-[#7769abbd] hover:text-white cursor-pointer flex items-center justify-between mr-3 transition"
            >
              <span>{user.username ? user.username : "Unnamed User"}</span>

              {/* Show notification box if there are unread messages */}
              {unreadMessages[user._id] > 0 && (
                <span className="bg-green-400 text-white h-10 w-10 rounded-5 flex items-center justify-center font-bold animate-pulse">
                  {unreadMessages[user._id]}
                </span>
              )}
            </li>
          ))}
        </ul>
      ) : (
        <></>
      )}
    </div>
  );
};

export default SearchBox;
