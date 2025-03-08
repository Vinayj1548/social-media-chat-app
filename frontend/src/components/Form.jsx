import { useState, useEffect, useContext } from "react";
import { AuthContext } from "./AuthContext";
import ChatUI from "./ChatUI";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css"; // Import styles

const Form = () => {
  const [formData, setFormData] = useState({
    username: "",
    email: "",
    password: "",
  });

  const { isAuthenticated } = useContext(AuthContext); // Use context
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [userID, setUserID] = useState(localStorage.getItem("user"));

  useEffect(() => {
    const storedUserId = localStorage.getItem("user");
    const storedAuth = localStorage.getItem("isAuthenticated");

    if (storedUserId) setUserID(storedUserId);
    if (storedAuth === "true") setIsLoggedIn(true);
  }, []);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    console.log("Form Submitted:", formData);

    try {
      let res = await fetch("http://backend-pearl-alpha.vercel.app/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      let data = await res.json();
      if (data.user && data.user.id) {
        const generatedUserId = data.user.id;
        localStorage.setItem("user", generatedUserId);
        localStorage.setItem("isAuthenticated", "true");
        localStorage.setItem("username" , data.user.username);

        setUserID(generatedUserId);
        setIsLoggedIn(true);
        toast.success("Registration successful! Redirecting...");

        setTimeout(() => window.location.reload(), 2000); // Delay for user experience
      } else {
        toast.error(data.message || "Registration failed! Try again.");
      }
    } catch (error) {
      console.error("Error registering user:", error);
      toast.error("Something went wrong! Please try again.");
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("isAuthenticated");
    localStorage.removeItem("user");
    localStorage.removeItem("username");
    setIsLoggedIn(false);
    setUserID(null);
    toast.info("You have been logged out.");
  };

  return (
    <div className="flex justify-center items-center">
      <ToastContainer position="top-right" autoClose={3000} hideProgressBar={false} />
      {!isAuthenticated ? (
        <div className="bg-[#5C4F82] p-15 rounded-5 w-130">
          <h2 className="text-2xl font-semibold text-center text-white mb-4">Register</h2>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-white">Username</label>
              <input
                type="text"
                name="username"
                value={formData.username}
                onChange={handleChange}
                className="text-white mt-1 block w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
                placeholder="Enter your username"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-white">Email</label>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                className="text-white mt-1 block w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
                placeholder="Enter your email"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-white">Password</label>
              <input
                type="password"
                name="password"
                value={formData.password}
                onChange={handleChange}
                className="text-white mt-1 block w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
                placeholder="Enter your password"
                required
              />
            </div>
            <button
              type="submit"
              className="w-full mt-3 bg-[#3BBFA7] hover:bg-[rgb(80,164,149)] text-white font-semibold py-2 px-4 hover:scale-110 rounded-3 transition duration-200"
            >
              Register
            </button>
          </form>
        </div>
      ) : (
        <ChatUI onLogout={handleLogout} />
      )}
    </div>
  );
};

export default Form;
