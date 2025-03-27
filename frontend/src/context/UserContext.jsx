/* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable no-unused-vars */
/* eslint-disable react/prop-types */
import { createContext, useContext, useEffect, useState } from "react";
import toast, { Toaster } from "react-hot-toast";
import axios from "axios";
import Swal from "sweetalert2";

const UserContext = createContext();

export const UserProvider = ({ children }) => {

  const BACKEND_URL = import.meta.env.VITE_BACKEND_URL;

  const [user, setUser] = useState([]);
  const [isAuth, setIsAuth] = useState(false);
  const [loading, setLoading] = useState(true);
  const [btnLoading, setBtnLoading] = useState(false);

  async function updateProfilePic(profilePic) {
    setUser((prev) => ({ ...prev, profilePic }));
  }

  async function registerUser(name, email, password, navigate, fetchPins) {
    setBtnLoading(true);
    try {
      const { data } = await axios.post(
        `${BACKEND_URL}/api/user/register`,
        {
          name,
          email,
          password,
        },
        { withCredentials: true }
      );

      toast.success(data.message);
      setUser(data.user);
      setIsAuth(true);
      setBtnLoading(false);
      navigate("/");
      fetchPins();
    } catch (error) {
      toast.error(error.response.data.message);
      setBtnLoading(false);
    }
  }

  async function loginUser(email, password, navigate, fetchPins) {
    setBtnLoading(true);
    try {
      const { data } = await axios.post(
        `${BACKEND_URL}/api/user/login`,
        { email, password },
        { withCredentials: true }
      );
  
      toast.success(data.message);
      setUser(data.user);
      setIsAuth(true);
      fetchPins(); 
      setBtnLoading(false);
      navigate("/");
    } catch (error) {
      toast.error(error.response.data.message);
      setBtnLoading(false);
    }
  }
  

  async function fetchUser() {
    try {
      const { data } = await axios.get(`${BACKEND_URL}/api/user/me`, { withCredentials: true });
  
      console.log("Fetched user data:", data); 
  
      setUser(data);
      setIsAuth(true);
      setLoading(false);
    } catch (error) {
      console.log(error);
      setLoading(false);
    }
  }  

  async function followUser(id, fetchUser) {
    try {
      const { data } = await axios.post(
        `${BACKEND_URL}/api/user/follow/${id}`,
        {}, 
        {
          headers: {
            Authorization: `Bearer ${user?.token}`,
          },
          withCredentials: true, 
        }
      );

      toast.success(data.message);
      fetchUser();
    } catch (error) {
      toast.error(error.response?.data?.message || "Follow request failed.");
    }
  }

  async function deleteUser(navigate) {
    try {
      const { data } = await axios.delete(`${BACKEND_URL}/api/user/delete`, {
        withCredentials: true,
      });
  
      Swal.fire("Deleted!", "Your account has been successfully deleted.", "success");
  
      setUser(null); 
      setIsAuth(false); 

      fetchUser();  
      navigate("/");
    } catch (error) {
      Swal.fire("Error", error.response?.data?.message || "Failed to delete account", "error");
    }
  }
  

  useEffect(() => {
    fetchUser();
  }, []);

  return (
    <UserContext.Provider
      value={{
        loginUser,
        deleteUser,
        btnLoading,
        isAuth,
        user,
        loading,
        registerUser,
        setIsAuth,
        setUser,
        followUser,
        updateProfilePic,
      }}
    >
      {children}
      <Toaster />
    </UserContext.Provider>
  );
};

export const UserData = () => useContext(UserContext);
