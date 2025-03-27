/* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable no-unused-vars */
/* eslint-disable react/prop-types */
import axios from "axios";
import { createContext, useContext, useEffect, useState } from "react";
import toast from "react-hot-toast";

const PinContext = createContext();

export const PinProvider = ({ children }) => {

  const BACKEND_URL = import.meta.env.VITE_BACKEND_URL;

  const [pin, setPin] = useState([]);
  const [pins, setPins] = useState([]);
  const [loading, setLoading] = useState(true);

  async function fetchPin(id) {
    setLoading(true);
    try {
      const { data } = await axios.get(`${BACKEND_URL}/api/pin/${id}`, {withCredentials: true});
      setPin(data);
      setLoading(false);
    } catch (error) {
      console.log(error);
      setLoading(false);
    }
  }

  async function fetchPins() {
    try {
      const { data } = await axios.get(`${BACKEND_URL}/api/pin/all`, { withCredentials: true });
  
      console.log("Fetched Pins:", data); 
      setPins(data);
      setLoading(false);
    } catch (error) {
      console.log(error);
      setLoading(false);
    }
  }

  async function addPin(
    formData,
    setFilePrev,
    setFile,
    setTitle,
    setPin,
    navigate
  ) {
    try {
      const { data } = await axios.post(`${BACKEND_URL}/api/pin/new`, formData, {withCredentials: true});

      toast.success(data.message);
      setFile([]);
      setFilePrev("");
      setPin("");
      setTitle("");
      fetchPins();
      navigate("/");
    } catch (error) {
      toast.error(error.response.data.message);
    }
  }

  async function deletePin(id, navigate) {
    setLoading(true);
    try {
      const { data } = await axios.delete(`${BACKEND_URL}/api/pin/${id}`, {withCredentials:true});
      toast.success(data.message);
      navigate("/");
      setLoading(false);
      fetchPins();
    } catch (error) {
      toast.error(error.response.data.message);
      setLoading(false);
    }
  }

  async function updatePin(id, title, pin, setEdit) {
    try {
      const { data } = await axios.put(`${BACKEND_URL}/api/pin/${id}`, { title, pin }, {withCredentials: true});
      toast.success(data.message);
      fetchPin(id);
      setEdit(false);
    } catch (error) {
      toast.error(error.response.data.message);
    }
  }

  async function addComment(id, comment, setComment) {
    try {
      const { data } = await axios.post(`${BACKEND_URL}/api/pin/comment/${id}`, { comment }, {withCredentials: true});
      toast.success(data.message);
      fetchPin(id);
      setComment("");
    } catch (error) {
      toast.error(error.response.data.message);
    }
  }

  async function deleteComment(id, commentId) {
    try {
      const { data } = await axios.delete(
        `${BACKEND_URL}/api/pin/comment/${id}?commentId=${commentId}`, {withCredentials:true}
      );
      toast.success(data.message);
      fetchPin(id);
    } catch (error) {
      toast.error(error.response.data.message);
    }
  }

  useEffect(() => {
    fetchPins();
  }, []);

  return (
    <PinContext.Provider
      value={{
        pins,
        loading,
        fetchPin,
        pin,
        updatePin,
        addComment,
        deleteComment,
        deletePin,
        addPin,
        fetchPins,
      }}
    >
      {children}
    </PinContext.Provider>
  );
};

export const PinData = () => useContext(PinContext);
