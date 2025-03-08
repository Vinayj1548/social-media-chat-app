import { useState, useContext } from "react";
import ChatUI from "./ChatUI";
import { ToastContainer, toast } from "react-toastify";
import { AuthContext } from "./AuthContext"; // Import AuthContext

const LoginForm = () => {
  const [formData, setFormData] = useState({ email: "", password: "" });
  const { isAuthenticated, login, logout } = useContext(AuthContext); // Use AuthContext

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    try {
      let response = await fetch("http://backend-pearl-alpha.vercel.app/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      let data = await response.json();

      if (data.user && data.user.id) {
        login(data.user.id); // ✅ Call login function from AuthContext
        localStorage.setItem("username" , data.user.username);
        toast.success("Login Successful", { position: "bottom-right" });
      } else {
        toast.error("Invalid credentials", { position: "bottom-right" });
      }
    } catch (error) {
      console.error("Login Error:", error);
      toast.error("Server error. Try again later.", { position: "bottom-right" });
    }
  };

  return (
    <div className="flex justify-center items-center">
      <ToastContainer />
      {!isAuthenticated ? (
        <div className="bg-[#5C4F82] p-15 rounded-4xl  w-110">
          <h2 className="text-2xl font-semibold text-center text-white mb-4">Login</h2>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-white">Email</label>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                className="text-white mt-1 block w-full px-4 py-2 border border-gray-300 rounded-lg  focus:ring-blue-500 focus:border-blue-500"
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
                className="text-white mt-1 block w-full px-4 py-2 border border-gray-300 rounded-lg  focus:ring-blue-500 focus:border-blue-500"
                placeholder="Enter your password"
                required
              />
            </div>

            <button
              type="submit"
              className="w-full mt-3 bg-[#3BBFA7] hover:bg-[rgb(80,164,149)] text-white font-semibold py-2 px-4 rounded-3 hover:scale-110 transition duration-200"
            >
              Login
            </button>
          </form>
        </div>
      ) : (
        <ChatUI onLogout={logout} /> // ✅ Logout function from AuthContext
      )}
    </div>
  );
};

export default LoginForm;
