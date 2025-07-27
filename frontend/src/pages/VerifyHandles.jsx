import React, { useState } from "react";
import { CheckCircle, XCircle } from "lucide-react";
import toast from "react-hot-toast";
import {
  refreshCodeforcesStats,
  verifyLeetcodeProfile,
} from "../services/api";
import DashBoard from "../components/DashBoard";

const VerifyHandles = () => {
  const [cfHandle, setCfHandle] = useState("");
  const [cfVerified, setCfVerified] = useState(false);

  const [lcUsername, setLcUsername] = useState("");
  const [lcToken, setLcToken] = useState("");
  const [lcVerified, setLcVerified] = useState(false);
  const [showPopup, setShowPopup] = useState(false);

  const handleCFVerify = async () => {
    try {
      await refreshCodeforcesStats(cfHandle.trim());
      setCfVerified(true);
      toast.success("Codeforces profile verified!");
    } catch (err) {
      console.error(err);
      toast.error("Failed to verify Codeforces handle.");
    }
  };

  const handleLeetcodeInitiate = () => {
    // Show token popup
    setShowPopup(true);
  };

  const handleLeetcodeVerify = async () => {
    try {
      await verifyLeetcodeProfile({
        username: lcUsername.trim(),
        token: lcToken.trim(),
      });
      setLcVerified(true);
      toast.success("Leetcode profile verified!");
    } catch (err) {
      console.error("Failed to initiate Leetcode verification: ", err);
      toast.error("Leetcode verification failed.");
    } finally {
      setShowPopup(false);
    }
  };

  return (
    <div className="p-6 max-w-xl mx-auto bg-black rounded-xl shadow-md space-y-6">
      <div className="h-16">
          <DashBoard/>
      </div>
      <h2 className="text-2xl font-bold text-center">Verify Handles</h2>

      {/* Codeforces */}
      <div className="space-y-2">
        <label className="block text-sm font-medium">Codeforces Handle</label>
        <input
          type="text"
          value={cfHandle}
          onChange={(e) => setCfHandle(e.target.value)}
          className="w-full border px-3 py-2 rounded-lg"
        />
        <button
          onClick={handleCFVerify}
          className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
        >
          Verify
        </button>
        {cfVerified && (
          <div className="flex items-center gap-2 text-green-600 mt-2">
            <CheckCircle size={18} /> Verified!
          </div>
        )}
      </div>

      <hr className="border-t border-gray-200" />

      {/* Leetcode */}
      <div className="space-y-2">
        <label className="block text-sm font-medium">Leetcode Username</label>
        <input
          type="text"
          value={lcUsername}
          onChange={(e) => setLcUsername(e.target.value)}
          className="w-full border px-3 py-2 rounded-lg"
        />
        <button
          onClick={handleLeetcodeInitiate}
          className="px-4 py-2 bg-orange-600 text-white rounded hover:bg-orange-700"
        >
          Verify
        </button>
        {lcVerified && (
          <div className="flex items-center gap-2 text-green-600 mt-2">
            <CheckCircle size={18} /> Verified!
          </div>
        )}
      </div>

      {/* Popup for Token Entry */}
      {showPopup && (
        <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50">
          <div className="bg-black p-6 rounded-xl space-y-4 w-96 shadow-lg">
            <h3 className="text-xl font-bold text-center">Paste Token in Leetcode Name Field</h3>
            <p className="text-gray-600 text-sm text-center">
              Paste the token below into your Leetcode profile's Name field and click Verify.
            </p>
            <div className="bg-gray-100 px-4 py-2 text-center rounded font-mono">
              {`verify_${lcToken || "your_token_here"}`}
            </div>
            <input
              type="text"
              placeholder="Paste same token here"
              value={lcToken}
              onChange={(e) => setLcToken(e.target.value)}
              className="w-full border px-3 py-2 rounded"
            />
            <div className="flex justify-between gap-2">
              <button
                onClick={() => setShowPopup(false)}
                className="w-1/2 px-4 py-2 bg-gray-300 rounded hover:bg-gray-400"
              >
                Cancel
              </button>
              <button
                onClick={handleLeetcodeVerify}
                className="w-1/2 px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700"
              >
                Verify
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default VerifyHandles;
