/* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable react/prop-types */
import axios from "axios";
import { useEffect, useState } from "react";
import { toast } from "react-toastify";
import { useParams } from "react-router-dom";
import { PinData } from "../context/PinContext";
import PinCard from "../components/PinCard";
import { UserData } from "../context/UserContext";

const UserProfile = ({ user: loggedInUser }) => {
  const BACKEND_URL = import.meta.env.VITE_BACKEND_URL;

  const params = useParams();
  const [user, setUser] = useState(loggedInUser);
  const [isFollow, setIsFollow] = useState(false);
  const { followUser } = UserData();

  async function fetchUser() {
    try {
      console.log("Sending Token:", user?.token);
      const { data } = await axios.get(
        `${BACKEND_URL}/api/user/${params.id}`,
        {
          headers: {
            Authorization: `Bearer ${user?.token}`,
          },
          withCredentials: true,
        }
      );
      setUser(data);
    } catch (error) {
      console.log(error);
      toast.error("Failed to fetch user.");
    }
  }

  const followHandler = () => {
    setIsFollow(!isFollow);
    followUser(user._id, fetchUser);
  };

  const { pins = [] } = PinData();
  const [userPins, setUserPins] = useState([]);

  useEffect(() => {
    if (!Array.isArray(pins) || pins.length === 0) return;
  
    if (!user?._id) {
      console.log("User ID not available yet!");
      return;
    }
  
    console.log("Updating userPins...", pins);
    const filteredPins = pins.filter((pin) => pin.owner?._id === user._id);
    console.log("Filtered User Pins:", filteredPins);
  
    setUserPins(filteredPins);
  }, [pins, user]);

  useEffect(() => {
    fetchUser();
  }, []);

  return (
    <div className="dark:bg-gray-800 dark:text-white dark:border-gray-600">
      {user && (
        <div className="flex flex-col items-center justify-center">
          <div className="p-6 w-full">
            <div className="flex items-center justify-center">
              <div className="relative w-24 h-24 rounded-full bg-gray-300 flex items-center justify-center">
                {user.profilePic ? (
                  <img
                    src={user.profilePic}
                    alt="Profile"
                    className="w-full h-full rounded-full object-cover"
                  />
                ) : (
                  <span className="text-3xl text-gray-700">
                    {user.name?.slice(0, 1)}
                  </span>
                )}
              </div>
            </div>

            <h1 className="text-center text-2xl font-bold mt-4">{user.name}</h1>
            <p className="text-center text-gray-600 mt-2 dark:text-gray-400">
              {user.email}
            </p>
            {/* Followers & Followings */}
            <p className="flex justify-center items-center text-center gap-3 text-gray-600 mt-2">
              {user.followers && (
                <p className="dark:text-gray-400">
                  {user.followers.length}{" "}
                  {user.followers.length === 1 ? "follower" : "followers"}
                </p>
              )}
              {user.followings && (
                <p className="dark:text-gray-400">
                  {user.followings.length}{" "}
                  {user.followings.length === 1 ? "following" : "followings"}
                </p>
              )}
            </p>
            {user && user._id === loggedInUser._id ? (
              ""
            ) : (
              <div className="flex justify-center mt-4 space-x-2">
                <button
                  onClick={followHandler}
                  className={`px-4 py-2 rounded ${
                    isFollow
                      ? "bg-red-500 text-white"
                      : "bg-gray-200 dark:bg-gray-700 dark:text-white text-black"
                  }`}
                >
                  {isFollow ? "Unfollow" : "Follow"}
                </button>
              </div>
            )}
            <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 justify-center">
              {userPins && userPins.length > 0 ? (
                userPins.map((e) => (
                  <div key={e._id}>
                    <PinCard pin={e} />
                  </div>
                ))
              ) : (
                <p className="text-xl font-semibold text-gray-500 col-span-full text-center">
                  📌 No Pins Yet !
                </p>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default UserProfile;
