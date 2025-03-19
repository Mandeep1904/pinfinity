/* eslint-disable react/prop-types */
import { PinData } from "../context/PinContext";
import { Loading } from "../components/Loading";
import PinCard from "../components/PinCard";

const Home = () => {
  const { pins, loading } = PinData();

  return (
    <div className="min-h-screen flex flex-col bg-gray-100 dark:bg-gray-900 dark:text-white">
      {loading ? (
        <Loading />
      ) : (
        <div className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8 w-full flex-grow dark:bg-gray-800 dark:text-white">
          <div className="px-4 py-6 sm:px-0">
            {pins && pins.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                {pins.map((e, i) => (
                  <PinCard key={i} pin={e} />
                ))}
              </div>
            ) : (
              <div className="flex items-center justify-center h-[70vh] w-full">
                <p className="text-3xl font-semibold text-gray-500 flex items-center gap-2">
                  📌 No Pins Yet!
                </p>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default Home;
