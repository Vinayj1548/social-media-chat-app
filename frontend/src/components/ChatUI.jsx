import { useState, useEffect, useRef, useContext } from "react";
import { socket } from "../socket";
import SearchBox from "./SearchBox";
import EmojiPicker from "emoji-picker-react";
import sendImg from "../assets/send.png";
import { FaSmile } from "react-icons/fa";
import { AuthContext } from "./AuthContext";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

const ChatUI = () => {
  const { isAuthenticated } = useContext(AuthContext); // Authentication context
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [message, setMessage] = useState("");
  const [messages, setMessages] = useState([]);
  const [selectedUser, setSelectedUser] = useState(null);
  const [notifications, setNotifications] = useState({}); // Store unseen message count

  const messagesEndRef = useRef(null);
  const emojiPickerRef = useRef(null);
  const usrID = localStorage.getItem("user"); // Logged-in user ID
  const usrName = localStorage.getItem("username");

  // Listen for new messages
  useEffect(() => {
    const handleReceiveMessage = (msgData) => {
      if (msgData.receiverID === usrID) {
        // Show toast notification if chat is not open
        if (selectedUser?.id !== msgData.senderID) {
          toast.info(`New message from ${msgData.senderName}: ${msgData.text}`, {
            position: "top-right",
            autoClose: 3000,
            hideProgressBar: false,
            closeOnClick: true,
            pauseOnHover: true,
            draggable: true,
            theme: "dark",
          });
        }

        // Update unread messages count for sender
        setNotifications((prev) => ({
          ...prev,
          [msgData.senderID]: (prev[msgData.senderID] || 0) + 1,
        }));

        setMessages((prev) => [...prev, msgData]);
      }
    };

    socket.on("receiveMessage", handleReceiveMessage);
    return () => socket.off("receiveMessage", handleReceiveMessage);
  }, [usrID, selectedUser]);

  // Reset unread count when opening a chat
  useEffect(() => {
    if (selectedUser?._id) {
      setNotifications((prev) => ({
        ...prev,
        [selectedUser._id]: 0,
      }));
    }
  }, [selectedUser]);

  // Scroll to the latest message
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // Hide emoji picker when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (emojiPickerRef.current && !emojiPickerRef.current.contains(event.target)) {
        setShowEmojiPicker(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const sendMessage = (e) => {
    e.preventDefault();
    if (!message.trim() || !selectedUser) return;

    const msgData = {
      text: message,
      senderID: usrID,
      senderName: usrName, // Change this based on your user auth data
      receiverID: selectedUser._id,
    };

    socket.emit("sendMessage", msgData);
    setMessages((prev) => [...prev, msgData]);
    setMessage("");
  };

  const addEmoji = (emoji) => {
    setMessage((prev) => prev + emoji.emoji);
  };

  if (!isAuthenticated) {
    return <div className="text-center text-white">Please log in to chat.</div>;
  }

  return (
    <div className="flex flex-row justify-center items-center w-screen p-4">
      {/* React Toast Container */}
      <ToastContainer />

      {/* SearchBox with unread notifications */}
      <SearchBox onSelectUser={setSelectedUser} notifications={notifications} />

      <div className="w-full h-180 bg-[#61568C] rounded-5 flex flex-col overflow-hidden">
        {selectedUser ? (
          <div className="bg-[#F2A488] text-white text-2xl font-bold w-full h-20 flex items-center justify-center rounded-b-3xl shadow-sm">
            Chatting with: {selectedUser.username}
          </div>
        ) : (
          <div className="text-center bg-transparent mt-3 text-2xl text-white font-bold">
            Select a user to chat
          </div>
        )}

        {/* Chat Messages */}
        <div className="flex-1 w-full overflow-y-auto space-y-2 p-2 flex flex-col-reverse">
          {messages
            .filter(
              (msg) =>
                (msg.senderID === usrID && msg.receiverID === selectedUser?._id) ||
                (msg.senderID === selectedUser?._id && msg.receiverID === usrID)
            )
            .slice()
            .reverse()
            .map((msg, index) => (
              <div key={index} className={`flex w-full ${msg.senderID === usrID ? "justify-end" : "justify-start"}`}>
                <div
                  className={`p-6 rounded-5 max-w-90 my-2 ${
                    msg.senderID === usrID ? "bg-[#F2A488] text-white shadow-xl mr-4" : "bg-[#504673] text-white shadow-xl ml-4"
                  }`}
                >
                  {msg.text}
                </div>
              </div>
            ))}
          <div ref={messagesEndRef} />
        </div>

        {/* Input & Emoji Section */}
        <form onSubmit={sendMessage} className=" flex items-center border-t-1 justify-between relative">
          {showEmojiPicker && (
            <div ref={emojiPickerRef} className="absolute bottom-20 left-30 bg-white shadow-md rounded-lg z-50">
              <EmojiPicker className="" onEmojiClick={addEmoji} />
            </div>
          )}

          <input
            type="text"
            placeholder="Type a message..."
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            className="flex-1 max-w-140 mx-auto mt-2 p-4 border text-2xl bg-white placeholder:text-2xl mb-3 rounded-5 focus:outline-none"
          />
          <button
            type="button"
            className="relative right-27 bottom-2 text-gray-500 text-2xl"
            onClick={() => setShowEmojiPicker(!showEmojiPicker)}
          >
            <FaSmile className="text-xl text-gray-700 p-2 h-14 w-auto" />
          </button>

          <button onClick={sendMessage} type="submit" className="bg-[#3BBFA7] flex items-center justify-center text-white h-15 w-15 mb-3 mx-auto rounded-5">
            <img className="h-10 flex items-center justify-center" src={sendImg} alt="" />
          </button>
        </form>
      </div>
    </div>
  );
};

export default ChatUI;




// import { useState, useEffect, useRef, useContext } from "react";
// import { socket } from "../socket";
// import SearchBox from "./SearchBox";
// import EmojiPicker from "emoji-picker-react";
// import { FaSmile } from "react-icons/fa";
// import { AuthContext } from "./AuthContext";

// const ChatUI = () => {
//   const { isAuthenticated } = useContext(AuthContext); // Auth state from context
//   const [showEmojiPicker, setShowEmojiPicker] = useState(false);
//   const [message, setMessage] = useState("");
//   const [messages, setMessages] = useState([]); // Messages only in state
//   const [selectedUser, setSelectedUser] = useState(null);

//   const messagesEndRef = useRef(null);
//   const emojiPickerRef = useRef(null);
//   const usrID = localStorage.getItem("user"); // Keeping user ID storage

//   // Listen for new messages
//   useEffect(() => {
//     const handleReceiveMessage = (msgData) => {
//       setMessages((prev) => [...prev, msgData]);
//     };

//     socket.on("receiveMessage", handleReceiveMessage);
//     return () => socket.off("receiveMessage", handleReceiveMessage);
//   }, []);

//   // Scroll to the latest message (bottom)
//   useEffect(() => {
//     messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
//   }, [messages]);

//   // Hide emoji picker when clicking outside
//   useEffect(() => {
//     const handleClickOutside = (event) => {
//       if (emojiPickerRef.current && !emojiPickerRef.current.contains(event.target)) {
//         setShowEmojiPicker(false);
//       }
//     };

//     document.addEventListener("mousedown", handleClickOutside);
//     return () => document.removeEventListener("mousedown", handleClickOutside);
//   }, []);

//   const sendMessage = (e) => {
//     e.preventDefault();
//     if (!message.trim() || !selectedUser) return;

//     const msgData = { text: message, senderID: usrID };
//     socket.emit("sendMessage", msgData);
//     setMessage("");
//   };

//   const addEmoji = (emoji) => {
//     setMessage((prev) => prev + emoji.emoji);
//   };

//   if (!isAuthenticated) {
//     return <div className="text-center text-white">Please log in to chat.</div>;
//   }

//   return (
//     <div className="flex flex-row justify-center items-center w-screen p-4">
//       <SearchBox onSelectUser={setSelectedUser} />
//       <div className="w-full h-180 bg-[#61568C] rounded-5 flex flex-col overflow-hidden">
//         {selectedUser ? (
//           <div className="bg-[#F2A488] text-white text-2xl font-bold w-full h-20 flex items-center justify-center rounded-b-3xl shadow-sm">
//             Chatting with: {selectedUser.username}
//           </div>
//         ) : (
//           <div className="text-center bg-transparent mt-3 text-2xl text-white font-bold">
//             Select a user to chat
//           </div>
//         )}

//         {/* Chat Messages Container */}
//         <div className="flex-1 w-full overflow-y-auto space-y-2 p-2 flex flex-col-reverse">
//           {messages.slice().reverse().map((msg, index) => (
//             <div key={index} className={`flex w-full ${msg.senderID === usrID ? "justify-end" : "justify-start"}`}>
//               <div className={`p-6 rounded-5 max-w-90 my-2 ${msg.senderID === usrID ? "bg-[#F2A488] text-white shadow-xl mr-4" : "bg-[#504673] text-white shadow-xl ml-4"}`}>
//                 {msg.text}
//               </div>
//             </div>
//           ))}
//           <div ref={messagesEndRef} />
//         </div>

//         {/* Input & Emoji Section */}
//         <form onSubmit={sendMessage} className="flex items-center justify-between mt-2 relative">
//           {showEmojiPicker && (
//             <div ref={emojiPickerRef} className="absolute bottom-20 left-30 bg-white shadow-md rounded-lg z-50">
//               <EmojiPicker className="w-full" onEmojiClick={addEmoji} />
//             </div>
//           )}

//           <input
//             type="text"
//             placeholder="Type a message..."
//             value={message}
//             onChange={(e) => setMessage(e.target.value)}
//             className="flex-1 max-w-120 mx-auto p-4 border text-2xl bg-white placeholder:text-2xl mb-3 rounded-5 focus:outline-none"
//           />
//           <button
//             type="button"
//             className="relative right-27 bottom-2 text-gray-500 text-2xl"
//             onClick={() => setShowEmojiPicker(!showEmojiPicker)}
//           >
//             <FaSmile className="text-xl text-gray-700 p-2 h-14 w-auto" />
//           </button>

//           <button type="submit" className="bg-[#3BBFA7] text-white h-20 w-20 mb-3 mx-auto rounded-5">
//             Send
//           </button>
//         </form>
//       </div>
//     </div>
//   );
// };

// export default ChatUI;

