import React, { useState } from 'react'
import DashBoard from '../components/DashBoard'
import Header from '../components/Header';
import { registerUser } from '../services/api'
import { useNavigate } from 'react-router-dom'

function Register() {
    const [loading,setLoading]=useState(false);
    const [error, setError] = useState("");
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
    e.preventDefault()
    const formData = new FormData(e.target)
    setLoading(true);
    setError("");

    try {
      const res = await registerUser(formData);
      console.log("Registered: ",res.data);
      alert("User registered successfully")

      // Redirect to login page
      navigate("/login");

    } catch (err) {
      console.error(err.response?.data || err);
      setError(err.response?.data?.message || "User with email or username already exists");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className='min-h-screen bg-gray-900 text-white'>
      
        <Header/>

        {/* Centered Form */}
      <div className="flex items-center justify-center h-[calc(100vh-4rem)] px-4 my-10">
        <form
          onSubmit={handleSubmit}
          className="bg-white text-black rounded-lg shadow-lg p-8 w-full max-w-md space-y-6"
        >
          <h2 className="text-2xl font-bold text-center text-gray-800">Create an Account</h2>

           {/* Error message */}
          {error && (
            <div className="text-red-600 text-sm text-center">
              {error}
            </div>
          )}

          <div>
            <label htmlFor="fullName" className="block mb-1 font-medium text-gray-700">
              Full Name
            </label>
            <input
              type="text"
              id="fullName"
              name="fullName"
              required
              className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-amber-400"
            />
          </div>

          <div>
            <label htmlFor="username" className="block mb-1 font-medium text-gray-700">
              Username
            </label>
            <input
              type="text"
              id="username"
              name="username"
              required
              className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-amber-400"
            />
          </div>

          <div>
            <label htmlFor="email" className="block mb-1 font-medium text-gray-700">
              Email
            </label>
            <input
              type="email"
              id="email"
              name="email"
              required
              className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-amber-400"
            />
          </div>

          <div>
            <label htmlFor="password" className="block mb-1 font-medium text-gray-700">
              Password
            </label>
            <input
              type="password"
              id="password"
              name="password"
              required
              className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-amber-400"
            />
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-amber-400 hover:bg-amber-500 text-black font-semibold py-2 rounded-md transition duration-200 disabled:opacity-60"
          >
            {loading ? "Registering..." : "Register"}
          </button>

          <p className="text-sm text-center text-gray-600">
            Already have an account? <a href="/login" className="text-amber-600 hover:underline">Login</a>
          </p>

        </form>
        
      </div>

    </div>
  )
}

export default Register