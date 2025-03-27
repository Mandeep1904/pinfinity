/* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable react/prop-types */
import { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { PinData } from "../context/PinContext";
import { Loading } from "../components/Loading";
import { MdDelete } from "react-icons/md";
import { FaEdit } from "react-icons/fa";
import { FaDownload } from "react-icons/fa";
import axios from "axios";
import toast from "react-hot-toast";
import Swal from "sweetalert2";
import { nanoid } from "nanoid";

const PinPage = ({ user }) => {
  const params = useParams();

  const BACKEND_URL = import.meta.env.VITE_BACKEND_URL;

  const {
    loading,
    fetchPin,
    pin,
    updatePin,
    addComment,
    deleteComment,
    deletePin,
  } = PinData();

  const [edit, setEdit] = useState(false);
  const [title, setTitle] = useState("");
  const [pinValue, setPinValue] = useState("");
  const [comment, setComment] = useState("");
  const [editingCommentId, setEditingCommentId] = useState(null);
  const [editedComment, setEditedComment] = useState("");
  const [setPin] = useState(null);

  const navigate = useNavigate();

  const editHandler = () => {
    setTitle(pin.title);
    setPinValue(pin.pin);
    setEdit(!edit);
  };

  const updateHandler = () => {
    updatePin(pin._id, title, pinValue, setEdit);
  };

  const submitHandler = (e) => {
    e.preventDefault();
    addComment(pin._id, comment, setComment);
  };

  const deletePinHandler = () => {
    Swal.fire({
      title: "Are you sure?",
      text: "You won't be able to revert this!",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#d33",
      cancelButtonColor: "#3085d6",
      confirmButtonText: "Yes, delete it!",
    }).then((result) => {
      if (result.isConfirmed) {
        deletePin(pin._id, navigate);
        Swal.fire("Deleted!", "Your pin has been deleted.", "success");
      }
    });
  };

  const deleteCommentHandler = (id) => {
    Swal.fire({
      title: "Are you sure?",
      text: "You won't be able to revert this!",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#d33",
      cancelButtonColor: "#3085d6",
      confirmButtonText: "Yes, delete it!",
    }).then((result) => {
      if (result.isConfirmed) {
        deleteComment(pin._id, id);
        Swal.fire("Deleted!", "Your comment has been deleted.", "success");
      }
    });
  };

  const editCommentHandler = (id, currentComment) => {
    setEditingCommentId(id);
    setEditedComment(currentComment);
  };

  const saveEditedComment = async () => {
    if (!editedComment.trim()) {
      setEditingCommentId(null);
      return;
    }

    try {
      // eslint-disable-next-line no-unused-vars
      const { data } = await axios.put(
        `${BACKEND_URL}/api/pin/comment/${pin._id}?commentId=${editingCommentId}`,
        { comment: editedComment },
        {
          headers: { Authorization: `Bearer ${user.token}` },
          withCredentials: true,
        }
      );

      toast.success("Comment updated!");

      if (setPin) {
        setPin((prev) => ({
          ...prev,
          comments: prev.comments.map((c) =>
            c._id === editingCommentId ? { ...c, comment: editedComment } : c
          ),
        }));
      } else {
        console.error(
          "setPin is not defined! Make sure it is passed correctly."
        );
      }

      setEditingCommentId(null);
      setEditedComment("");
    } catch (error) {
      console.error("Error updating comment:", error.response?.data || error);
      toast.error(error.response?.data?.message || "Error updating comment!");
    }
  };

  const downloadImage = async (url) => {
    try {
      const response = await fetch(url);
      const blob = await response.blob();

      const randomName = `pin-${nanoid(10)}.png`;
      const link = document.createElement("a");
      link.href = URL.createObjectURL(blob);
      link.download = randomName;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } catch (error) {
      console.error("Error downloading image:", error);
    }
  };

  useEffect(() => {
    fetchPin(params.id);
  }, [params.id]);

  return (
    <div>
      {pin && (
        <div className="flex flex-col items-center bg-gray-100 p-4 min-h-screen dark:bg-gray-800">
          {loading ? (
            <Loading />
          ) : (
            <div className="bg-white rounded-lg shadow-lg flex flex-wrap w-full max-w-4xl dark:bg-gray-600 dark:text-white">
              <div className="w-full md:w-1/2 bg-gray-200 rounded-t-lg md:rounded-l-lg md:rounded-t-none flex items-center justify-center">
                {pin.image && (
                  <img
                    src={pin.image.url}
                    alt=""
                    className="object-cover w-full rounded-t-lg md:rounded-l-lg md:rounded-t-none"
                  />
                )}
              </div>

              <div className="w-full md:w-1/2 p-6 flex flex-col ">
                {/* Edit title & Description */}
                <div className="flex items-center justify-between mb-4">
                  {edit ? (
                    <input
                      value={title}
                      onChange={(e) => setTitle(e.target.value)}
                      className="common-input dark:bg-gray-800 dark:text-white dark:border-gray-600"
                      style={{ width: "200px" }}
                      placeholder="Enter Title"
                    />
                  ) : (
                    <h1 className="text-2xl font-bold">{pin.title}</h1>
                  )}

                  {/* Always showing Download Button */}
                  <button
                    onClick={() => downloadImage(pin.image.url)}
                    className="bg-green-500 text-white py-1 px-3 rounded flex items-center"
                  >
                    <FaDownload />
                  </button>

                  {pin.owner && pin.owner._id === user._id && (
                    <div className="flex items-center gap-2">
                      {/* Edit Button */}
                      <button
                        onClick={editHandler}
                        className="bg-blue-500 text-white py-1 px-3 rounded flex items-center"
                      >
                        <FaEdit />
                      </button>
                      {/* Delete Button */}
                      <button
                        onClick={deletePinHandler}
                        className="bg-red-500 text-white py-1 px-3 rounded flex items-center"
                      >
                        <MdDelete />
                      </button>
                    </div>
                  )}
                </div>

                {edit ? (
                  <input
                    value={pinValue}
                    onChange={(e) => setPinValue(e.target.value)}
                    className="common-input dark:bg-gray-800 dark:text-white dark:border-gray-600"
                    style={{ width: "200px" }}
                    placeholder="Enter Title"
                  />
                ) : (
                  <p className="mb-6">{pin.pin}</p>
                )}

                {edit && (
                  <button
                    style={{ width: "200px" }}
                    className="bg-red-500 text-white py-1 px-3 mt-2 mb-2"
                    onClick={updateHandler}
                  >
                    Update
                  </button>
                )}

                {pin.owner && (
                  <div className="flex items-center justify-between border-b pb-4 mb-4">
                    <div className="flex items-center">
                      <Link to={`/user/${pin.owner._id}`}>
                        <div className="rounded-full h-12 w-12 bg-gray-300 flex items-center justify-center">
                          <span className="font-bold">
                            {pin.owner.profilePic ? (
                              <img
                                src={pin.owner.profilePic}
                                alt="Profile"
                                className="w-full h-12 rounded-full object-cover"
                              />
                            ) : (
                              <span className="text-3xl text-gray-700">
                                {pin.owner.name?.slice(0, 1)}
                              </span>
                            )}
                          </span>
                        </div>
                      </Link>
                      <div className="ml-4">
                        <h2 className="text-lg font-semibold">
                          {pin.owner.name}
                        </h2>
                        <p className="text-gray-500 dark:text-white">
                          {user.followings.length}{" "}
                          {user.followings.length === 1
                            ? "following"
                            : "followings"}
                        </p>
                      </div>
                    </div>
                  </div>
                )}

                <hr className="font-bold text-gray-400" />

                {/* Add a comment on the pin */}
                <div className="flex items-center mt-4">
                  <div className="rounded-full h-12 w-12 bg-gray-300 flex items-center justify-center mr-4">
                    <span className="font-bold">
                      {user.profilePic ? (
                        <img
                          src={user.profilePic}
                          alt="Profile"
                          className="w-full h-12 rounded-full object-cover "
                        />
                      ) : (
                        <span className="text-2xl text-gray-700">
                          {user.name?.slice(0, 1)}
                        </span>
                      )}
                    </span>
                  </div>

                  <form className="flex-1 flex" onSubmit={submitHandler}>
                    <input
                      type="text"
                      placeholder="Enter Comment"
                      className="flex-1 border rounded-lg p-2 dark:bg-gray-800 dark:text-white dark:border-gray-600"
                      value={comment}
                      onChange={(e) => setComment(e.target.value)}
                      required
                    />

                    <button
                      type="submit"
                      className="ml-2 bg-red-500 px-4 py-2 rounded-md text-white"
                    >
                      Add+
                    </button>
                  </form>
                </div>

                <hr className="font-bold text-gray-400 mt-3 mb-3" />

                {/* Display all comments on the pin */}
                <div className="overflow-y-auto h-64">
                  {pin.comments && pin.comments.length > 0 ? (
                    pin.comments.map((e, i) => (
                      <div
                        className="flex items-center justify-between mb-3"
                        key={i}
                      >
                        <div className="flex items-center gap-5">
                          <Link to={`/user/${e.user}`}>
                            <div className="rounded-full h-12 w-12 bg-gray-300 flex items-center justify-center overflow-hidden">
                              {e.user && e.user?.profilePic ? (
                                <img
                                  src={e.user?.profilePic}
                                  alt="Profile"
                                  className="w-full h-full object-cover"
                                />
                              ) : (
                                <span className="text-lg text-gray-700 font-bold">
                                  {e.name.slice(0, 1)}
                                </span>
                              )}
                            </div>
                          </Link>

                          <div>
                            <h2 className="text-m font-semibold text-gray-800 dark:text-gray-300">
                              {e.name}
                            </h2>

                            {editingCommentId === e._id ? (
                              <input
                                type="text"
                                value={editedComment}
                                onChange={(event) =>
                                  setEditedComment(event.target.value)
                                }
                                onBlur={() => saveEditedComment(e._id)}
                                onKeyDown={(event) => {
                                  if (event.key === "Enter")
                                    saveEditedComment(e._id);
                                }}
                                className="border border-gray-300 rounded p-1 w-full dark:bg-gray-800 dark:text-white dark:border-gray-600"
                                autoFocus
                              />
                            ) : (
                              <p
                                className="text-gray-600 text-m cursor-pointer dark:text-gray-300"
                                onClick={() =>
                                  editCommentHandler(e._id, e.comment)
                                }
                              >
                                {e.comment}
                              </p>
                            )}
                          </div>
                        </div>

                        {e.user === user._id && (
                          <div className="flex gap-2">
                            <button
                              onClick={() => {
                                console.log("Editing comment:", e._id);
                                setEditingCommentId(e._id);
                                setEditedComment(e.comment);
                              }}
                              className="bg-blue-500 text-white py-1 px-3 rounded text-sm"
                            >
                              <FaEdit />
                            </button>

                            <button
                              onClick={() => deleteCommentHandler(e._id)}
                              className="bg-red-500 text-white py-1 px-3 rounded text-sm"
                            >
                              <MdDelete />
                            </button>
                          </div>
                        )}
                      </div>
                    ))
                  ) : (
                    <div className="flex flex-col items-center justify-center text-center mt-6 p-6 border border-dashed border-gray-400 rounded-lg bg-gray-50 dark:bg-gray-700">
                      <p className="text-lg font-semibold dark:text-gray-400 text-gray-600 ">
                        No comments yet...
                      </p>
                      <p className="text-sm dark:text-gray-400 text-gray-600 ">
                        Be the first one to share your thoughts!
                      </p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default PinPage;
