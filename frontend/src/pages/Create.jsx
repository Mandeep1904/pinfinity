import { useRef, useState } from "react";
import { FaPlus } from "react-icons/fa";
import { PinData } from "../context/PinContext";
import { useNavigate } from "react-router-dom";

const Create = () => {
  const inputRef = useRef(null);

  const handleClick = () => {
    inputRef.current.click();
  };

  const [file, setFile] = useState("");
  const [filePrev, setFilePrev] = useState("");
  const [title, setTitle] = useState("");
  const [pin, setPin] = useState("");
  const { addPin } = PinData();

  const changeFileHandler = (e) => {
    const file = e.target.files[0];
    const reader = new FileReader();

    reader.readAsDataURL(file);

    reader.onloadend = () => {
      setFilePrev(reader.result);
      setFile(file);
    };
  };

  const navigate = useNavigate();

  const addPinHandler = (e) => {
    e.preventDefault();

    const formData = new FormData();

    formData.append("title", title);
    formData.append("pin", pin);
    formData.append("file", file);

    addPin(formData, setFilePrev, setFile, setTitle, setPin, navigate);
  };
  return (
    <div className="dark:text-white dark:bg-gray-800 min-h-screen flex justify-center items-center">
      <div className="flex flex-wrap justify-center items-center gap-2 ">
        {/* Image Upload Box */}
        <div className="flex items-center justify-center">
          <div className="flex flex-col items-center justify-center w-80 h-auto p-6 bg-white dark:bg-gray-600 rounded-lg shadow-lg">
            {filePrev && <img src={filePrev} alt="" />}
            <div
              className="flex flex-col items-center justify-center h-full cursor-pointer"
              onClick={handleClick}
            >
              <input
                ref={inputRef}
                type="file"
                accept="image/*"
                className="hidden"
                onChange={changeFileHandler}
              />
              <div className="w-12 h-12 mb-4 flex items-center justify-center bg-gray-200 dark:bg-gray-700 rounded-full">
                <FaPlus className="dark:text-white" />
              </div>
              <p className="text-gray-500 dark:text-gray-300">Choose a file</p>
            </div>
            <p className="mt-4 text-sm text-gray-400 dark:text-gray-300">
              We recommend using high quality .jpg or .png files but less than
              10mb
            </p>
          </div>
        </div>

        {/* Form Section */}
        <div>
          <div className="flex items-center justify-center bg-gray-100 dark:bg-gray-800">
            <form
              className="w-full max-w-lg p-6 bg-white dark:bg-gray-700 rounded-lg shadow-lg"
              onSubmit={addPinHandler}
            >
              <div className="mb-4">
                <label
                  htmlFor="title"
                  className="block text-sm font-medium text-gray-700 dark:text-gray-300"
                >
                  Title
                </label>
                <input
                  type="text"
                  id="title"
                  className="common-input dark:bg-gray-800 dark:text-white dark:border-gray-600"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  required
                />
              </div>
              <div className="mb-4">
                <label
                  htmlFor="pin"
                  className="block text-sm font-medium text-gray-700 dark:text-gray-300"
                >
                  Description
                </label>
                <input
                  type="text"
                  id="pin"
                  className="common-input dark:bg-gray-800 dark:text-white dark:border-gray-600"
                  value={pin}
                  onChange={(e) => setPin(e.target.value)}
                  required
                />
              </div>
              <button className="common-btn bg-[#0DCEDA] hover:bg-[#0DB8C2] dark:bg-[#0DCEDA] dark:hover:bg-[#0DB8C2]">
                Add+
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Create;
