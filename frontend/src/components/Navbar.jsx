import { useState, useEffect, useContext } from "react";
import navIcon from "../assets/chat.png";
import { Link } from "react-router-dom";
import { AuthContext } from "./AuthContext";
import Logout from "./Logout";
import DeleteButton from "./DeleteButton";
import axios from "axios"; // Import axios to fetch user data

const Navbar = () => {
  const { isAuthenticated, logout } = useContext(AuthContext);
  const [username, setUsername] = useState("");

  useEffect(() => {
    const fetchUser = async () => {
      try {
        // Make an API request to get the logged-in user's details
        const response = await axios.get("http://localhost:5000/api/users"); // Replace with your actual API endpoint
        const users = await response.data;
        const loggedUserID = localStorage.getItem("user");

        // Find the matching user from the API response
        const matchedUser = users.find((user) => user._id === loggedUserID);

        if (matchedUser) {
          setUsername(matchedUser.username);
        }
      } catch (error) {
        console.error("Error fetching user data:", error);
      }
    };

    if (isAuthenticated) {
      fetchUser();
    }
  }, [isAuthenticated]);

  const handleDelete = async () => {
    console.log("Deleted");
  };

  const handleLogout = () => {
    logout();
  };

  return (
    <nav className="fixed top-0 left-0 text-white h-20 flex items-center justify-between px-6 w-full bg-[#504673da] shadow-sm">
      <h1 className="text-2xl flex flex-row items-center">
        <img className="w-10 h-10 mr-2" src={navIcon} alt="Chat Icon" />
        SpooChat
      </h1>

      <div className="flex items-center gap-6">
        {isAuthenticated ? (
          <div className="flex items-center gap-6">
            {/* Show Logged-in User's Name */}
            {(username) ? (
              <span className="text-xl font-semibold text-white">
                Welcome, {username}
              </span>
            ):<>No User</>}
            
            <Logout handleLogout={handleLogout} />
            <DeleteButton deleteAcc={handleDelete} />
          </div>
        ) : (
          <div className="md:flex gap-4">
            {/* Login & Signup Buttons */}
            <Link to="/login">
              <button className="px-6 py-2 text-white font-semibold  hover:underline">
                Login
              </button>
            </Link>
            <Link to="/signup">
              <button className="px-6 py-2 text-white font-semibold hover:underline">
                Signup
              </button>
            </Link>
          </div>
        )}
      </div>
    </nav>
  );
};

export default Navbar;
