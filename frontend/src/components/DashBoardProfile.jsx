import React, { useState, useRef, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { UserCircle2 } from 'lucide-react' // You can use any icon here


function DashBoardProfile() {
    const [menuOpen, setMenuOpen] = useState(false);
    const menuRef = useRef();
    const navigate = useNavigate();

    // Close dropdown if clicked outside
    useEffect(() => {
        const handler = (e) => {
        if (menuRef.current && !menuRef.current.contains(e.target)) {
            setMenuOpen(false);
        }
        };
        document.addEventListener("mousedown", handler);
        return () => document.removeEventListener("mousedown", handler);
    }, []);

    const handleLogout = () => {
        // Clear tokens / logout logic
        localStorage.clear(); // or remove specific token
        navigate('/login');
    };

  return (
    <header className="fixed top-0 left-0 w-full h-14 bg-gray-950 shadow-sm z-50">
        <div className='flex justify-between items-center h-full w-full px-4'>

            <div className='text-xl font-semibold text-purple-700'>
            StarkPrep
            </div >

    
        {/* Navigation + Profile */}
        <div className="flex items-center gap-6 text-white font-semibold text-xl my-2 relative">

          {/* Navigation links */}
          <Link to="/contest-tracker" className="hover:text-amber-300">Event Tracker</Link>

          {/* User Profile Icon */}
          <div className="relative" ref={menuRef}>
            <button onClick={() => setMenuOpen(prev => !prev)} className="hover:text-amber-300">
              <UserCircle2 className="w-8 h-8" />
            </button>

            {/* Dropdown Menu */}
            {menuOpen && (
              <div className="absolute right-0 mt-2 w-48 bg-white text-black rounded-lg shadow-lg py-2 z-50">
                <Link
                  to="/edit-profile"
                  className="block px-4 py-2 hover:bg-gray-100"
                  onClick={() => setMenuOpen(false)}
                >
                  Edit Profile
                </Link>
                <Link
                  to="/verify-handles"
                  className="block px-4 py-2 hover:bg-gray-100"
                  onClick={() => setMenuOpen(false)}
                >
                  Verify Handles
                </Link>
                <button
                  onClick={handleLogout}
                  className="block w-full text-left px-4 py-2 hover:bg-gray-100"
                >
                  Logout
                </button>
              </div>
            )}
          </div>

        </div>

        </div>
    </header>
  )
}

export default DashBoardProfile