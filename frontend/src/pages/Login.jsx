import {useState} from 'react'
import DashBoard from '../components/DashBoard'
import Header from '../components/Header'
import { loginUser } from '../services/api';
import { useNavigate } from 'react-router-dom';

function Login() {
     const [loading, setLoading] = useState(false);
     const navigate = useNavigate();


    const handleSubmit = async (e) => {
    e.preventDefault();
    const formData = new FormData(e.target);
    const payload = Object.fromEntries(formData.entries());
    setLoading(true);

    try {
      const res = await loginUser(payload);
      console.log("Login successful", res.data);
      alert("Login successful!");
      // Redirect to Profile page
      navigate('/profile');
    } catch (err) {
      const status = err.response?.status;
      if (status === 404) {
        alert("User not found. Please register first.");
      } else if (status === 401) {
        alert("Invalid credentials. Please try again.");
      } else {
        alert("Login failed. Something went wrong.");
      }
      console.error("Login error:", err.response?.data || err);
    }
  };

  return (
    <div className='min-h-screen bg-gray-900 text-white'>

        <Header/>

        <div className="flex items-center justify-center h-[calc(100vh-4rem)] px-4">
        <form
          onSubmit={handleSubmit}
          className="bg-white text-black rounded-lg shadow-lg p-8 w-full max-w-md space-y-6"
        >
          <h2 className="text-2xl font-bold text-center text-gray-800">Login to StarkPrep</h2>

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

          <button
            type="submit" disabled={loading}
            className="w-full bg-amber-400 hover:bg-amber-500 text-black font-semibold py-2 rounded-md transition duration-200"
          >
            {loading ? "Logging in..." : "Login"}
          </button>
        </form>
        </div>


    </div>
  )
}

export default Login