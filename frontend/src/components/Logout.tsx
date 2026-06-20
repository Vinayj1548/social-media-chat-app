import { LogOut } from "lucide-react";

type LogoutProps = {
  handleLogout: () => void;
};

const Logout = ({ handleLogout }: LogoutProps) => {
  return (
    <button
      onClick={handleLogout}
      className="
    flex
    items-center
    gap-2
    rounded-lg
    border
    border-red-400/30
    px-4
    py-2
    text-sm
    font-medium
    text-red-300
    transition-all
    duration-200
    hover:bg-red-500/10
  "
    >
      <LogOut size={16} />
      Logout
    </button>
  );
};

export default Logout;
