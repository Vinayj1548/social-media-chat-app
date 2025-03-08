import { useContext, useState} from 'react';
import { useNavigate } from 'react-router-dom';
import Modal from 'react-bootstrap/Modal';
import { AuthContext } from './AuthContext';

function DeleteButton() {
  const {logout} = useContext(AuthContext);
  const [show, setShow] = useState(false);
  const [formData, setFormData] = useState({
    username: "",
    password: "",
  });

  const navigate = useNavigate(); // For redirection

  const handleClose = () => setShow(false);
  const handleShow = () => setShow(true);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const deleteUsr = async () => {
    try {
      const res = await fetch("http://backend-pearl-alpha.vercel.app/api/auth/delete", {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      });

      const data = await res.json();
      console.log(data);

      if (res.ok) {
        // Clear localStorage
        localStorage.clear();
        logout(); // Clears all stored data

        // Redirect to Signup page
        navigate("/signup");
      } else {
        console.error("Error deleting account:", data.message);
      }
    } catch (err) {
      console.error("Error:", err.message);
    }
  };

  return (
    <>
      <button
        className="px-6 py-2 text-2xl text-white font-semibold duration-300 hover:underline"
        onClick={handleShow}
      >
        Delete Account
      </button>

      <Modal className='text-white' show={show} onHide={handleClose}>
        <Modal.Header className='bg-[#61568C] text-white'>
          <Modal.Title>Confirm Deletion</Modal.Title>
        </Modal.Header>
        <Modal.Body className='bg-[#61568C]'>
          <p>Do you want to delete your account?</p>
          <p>Enter your username:</p>
          <input
            className="w-full focus:outline-none mb-4 rounded-lg p-2 shadow-lg "
            placeholder="Enter your username..."
            onChange={handleChange}
            name="username"
            value={formData.username}
            type="text"
          />
          <p>Enter your password:</p>
          <input
            className="w-full focus:outline-none rounded-lg p-2 shadow-lg "
            placeholder="Enter password..."
            onChange={handleChange}
            name="password"
            value={formData.password}
            type="password"
          />
        </Modal.Body>
        <Modal.Footer className='bg-[#61568C]'>
          <button
            className="px-6 py-2 bg-[#61568C] text-white font-semibold rounded-2 shadow-md transition-all duration-300  hover:shadow-lg transform hover:-translate-y-1"
            onClick={handleClose}
          >
            Close
          </button>
          <button
            className="px-6 py-2 bg-[#61568C] text-white font-semibold rounded-2 shadow-md transition-all duration-300  hover:shadow-lg transform hover:-translate-y-1"
            onClick={() => {
              handleClose();
              deleteUsr();
            }}
          >
            Delete
          </button>
        </Modal.Footer>
      </Modal>
    </>
  );
}

export default DeleteButton;

// "use client"

// import React from "react"


// const DeleteButton = ({deleteAcc}) => {
//   return (
//     <button
//     onClick={deleteAcc} 
//     className="px-6 py-2 bg-amber-500 text-white font-semibold rounded-xl shadow-md transition-all duration-300 hover:bg-amber-600 hover:shadow-lg transform hover:-translate-y-1"
//     >
//         Delete
//     </button>
//   )
// }

// export default DeleteButton

