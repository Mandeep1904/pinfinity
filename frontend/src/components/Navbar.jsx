/* eslint-disable react/prop-types */
import { Link } from "react-router-dom";
import { ThemeContext } from "../context/ThemeContext";
import { FaMoon, FaSun } from "react-icons/fa";
import { useContext } from "react";

const Navbar = ({ user }) => {
  const { theme, toggleTheme } = useContext(ThemeContext);

  return (
    <div>
      <div className="bg-gray-200 shadow-sm dark:bg-gray-900 dark:text-white">
        <div className="mx-auto px-4 py-2 flex justify-between items-center">
          <Link to="/" className="flex items-center mr-5">
            <img
              src="/pinfinity_logo_for_navbar.png"
              alt="Pinfinity Logo"
              className="h-14 w-auto"
            />
          </Link>
          <div className="flex items-center space-x-4 ">
            <button
              onClick={toggleTheme}
              className="p-2 rounded-full bg-gray-200 dark:bg-gray-700 text-gray-900 dark:text-yellow-300"
            >
              {theme === "dark" ? <FaSun size={20} /> : <FaMoon size={20} />}
            </button>
            <Link
              to="/"
              className="text-gray-700 hover:text-gray-900 dark:text-white "
            >
              Home
            </Link>
            <Link
              to="/create"
              className="text-gray-700 hover:text-gray-900 dark:text-white"
            >
              Create
            </Link>
            <Link
              to="/account"
              className="flex items-center justify-center w-10 h-10 rounded-full overflow-hidden bg-gray-300"
            >
              {user.profilePic ? (
                <img
                  src={user.profilePic}
                  alt="Profile"
                  className="w-full h-full object-cover rounded-full"
                />
              ) : (
                <span className="text-xl text-gray-700">
                  {user.name.slice(0, 1)}
                </span>
              )}
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Navbar;
