type LogoutProps = {
  handleLogout: () => void;
};

const Logout = ({ handleLogout }: LogoutProps) => {
  return (
    <button
      onClick={handleLogout}
      className="px-6 py-2 text-2xl text-white font-semibold duration-300 hover:underline"
    >
      Logout
    </button>
  );
};

export default Logout;