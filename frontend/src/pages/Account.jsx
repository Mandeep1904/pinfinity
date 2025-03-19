/* eslint-disable no-unused-vars */
/* eslint-disable react/prop-types */
import { PinData } from "../context/PinContext";
import PinCard from "../components/PinCard";
import toast from "react-hot-toast";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { UserData } from "../context/UserContext";
import { useState, useCallback, useEffect } from "react";
import Cropper from "react-easy-crop";
import Swal from "sweetalert2";

const Account = ({ user }) => {
  const BACKEND_URL = import.meta.env.VITE_BACKEND_URL;

  const navigate = useNavigate();
  const { setIsAuth, setUser, updateProfilePic } = UserData();
  const { deleteUser } = UserData();

  const [selectedImage, setSelectedImage] = useState(null);
  const [crop, setCrop] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [cropArea, setCropArea] = useState(null);
  const [filter, setFilter] = useState("none");
  const [showEditor, setShowEditor] = useState(false);

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

  const logoutHandler = async () => {
    try {
      const { data } = await axios.get(`${BACKEND_URL}/api/user/logout`, {
        withCredentials: true,
      });
      toast.success(data.message);
      navigate("/login");
      setIsAuth(false);
      setUser([]);
    } catch (error) {
      toast.error(error.response.data.message);
    }
  };

  const handleDelete = () => {
    Swal.fire({
      title: "Are you sure?",
      text: "This action is irreversible! Your account and data will be permanently deleted.",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#d33",
      cancelButtonColor: "#3085d6",
      confirmButtonText: "Yes, delete my account!",
    }).then((result) => {
      if (result.isConfirmed) {
        deleteUser(navigate);
      }
    });
  };

  const handleProfilePicChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setSelectedImage(URL.createObjectURL(file));
    setShowEditor(true);
  };

  const handleCropComplete = useCallback((_, croppedAreaPixels) => {
    setCropArea(croppedAreaPixels);
  }, []);

  const handleUpload = async () => {
    if (!selectedImage || !cropArea) return;

    const canvas = document.createElement("canvas");
    const image = new Image();
    image.src = selectedImage;
    image.crossOrigin = "anonymous";

    image.onload = async () => {
      const ctx = canvas.getContext("2d");
      canvas.width = cropArea.width;
      canvas.height = cropArea.height;

      ctx.filter = filter;
      ctx.drawImage(
        image,
        cropArea.x,
        cropArea.y,
        cropArea.width,
        cropArea.height,
        0,
        0,
        canvas.width,
        canvas.height
      );

      canvas.toBlob(async (blob) => {
        const formData = new FormData();
        formData.append("file", blob, "profile-pic.jpg");

        try {
          const { data } = await axios.put(
            `${BACKEND_URL}/api/user/update-profile-pic`,
            formData,
            {
              headers: { "Content-Type": "multipart/form-data" },
              withCredentials: true,
            }
          );

          updateProfilePic(data.profilePic);
          toast.success("Profile picture updated!");
          setShowEditor(false);
        } catch (error) {
          toast.error("Failed to upload profile picture");
        }
      }, "image/jpeg");
    };
  };

  return (
    <div>
      <div className="flex flex-col items-center justify-center dark:text-white dark:bg-gray-800">
        <div className="p-6 w-full">
          <div className="flex items-center justify-center">
            <div className="relative w-24 h-24 rounded-full bg-gray-300 flex items-center justify-center">
              {/* Optionally showing profile pic or first letter of user's name */}
              {user.profilePic ? (
                <img
                  src={user.profilePic}
                  alt="Profile Pic"
                  className="w-full h-full rounded-full object-cover"
                />
              ) : (
                <span className="text-3xl text-gray-700">
                  {user.name?.slice(0, 1)}
                </span>
              )}

              {/* File Input */}
              <label className="absolute bottom-0 right-0 bg-gray-800 text-white rounded-full p-1 cursor-pointer">
                📸
                <input
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={handleProfilePicChange}
                />
              </label>
            </div>
          </div>

          {/* User's name & mail ID */}
          <h1 className="text-center text-2xl font-bold mt-4">{user.name}</h1>
          <p className="text-center text-gray-600 mt-2 dark:text-gray-300">
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

          <div className="flex justify-center mt-4 space-x-4">
            {/* Logout Button */}
            <button
              onClick={logoutHandler}
              className="bg-gray-200 px-4 py-2 rounded bg-red-500 text-white"
            >
              Logout
            </button>

            {/* Delete Account Button */}
            <button
              onClick={handleDelete}
              className="bg-gray-200 px-4 py-2 rounded bg-red-700 text-white"
            >
              Delete Account
            </button>
          </div>

          {/* Showing pins created by user */}
          <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 justify-center">
            {userPins && userPins.length > 0 ? (
              userPins.map((e) => <PinCard key={e._id} pin={e} />)
            ) : (
              <p className="text-xl font-semibold text-gray-500 col-span-full text-center">
                📌 No Pins Yet !
              </p>
            )}
          </div>
        </div>
      </div>

      {/* Profile Pic Editor Modal */}
      {showEditor && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
          <div className="bg-white p-4 rounded-lg shadow-lg">
            <h2 className="text-lg font-bold">Edit Profile Picture</h2>

            <div className="relative w-64 h-64">
              <Cropper
                image={selectedImage}
                crop={crop}
                zoom={zoom}
                aspect={1}
                onCropChange={setCrop}
                onZoomChange={setZoom}
                onCropComplete={handleCropComplete}
              />
            </div>

            <div className="mt-2">
              <label className="block text-sm font-medium">Zoom</label>
              <input
                type="range"
                min="1"
                max="3"
                step="0.1"
                value={zoom}
                onChange={(e) => setZoom(parseFloat(e.target.value))}
                className="w-full"
              />
            </div>

            <div className="mt-2">
              <label className="block text-sm font-medium">Filter</label>
              <select
                value={filter}
                onChange={(e) => setFilter(e.target.value)}
                className="border rounded p-1 w-full"
              >
                <option value="none">None</option>
                <option value="brightness(1.2)">Bright</option>
                <option value="contrast(1.5)">High Contrast</option>
                <option value="sepia(1)">Sepia</option>
              </select>
            </div>

            <div className="flex justify-end mt-4 space-x-2">
              <button
                className="bg-gray-300 px-4 py-2 rounded"
                onClick={() => setShowEditor(false)}
              >
                Cancel
              </button>
              <button
                className="bg-blue-500 text-white px-4 py-2 rounded"
                onClick={handleUpload}
              >
                Save
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Account;
