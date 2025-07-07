import React from 'react'
import { Link } from 'react-router-dom'

function Header() {
  return (
    <header className="fixed top-0 left-0 w-full h-16 bg-gray-950 shadow-sm z-50">
        <div className='flex justify-between items-center h-full w-full px-4'>

          <div className='text-xl font-semibold text-amber-300'>
            StarkPrep
          </div>

          <div className='text-black font-semibold text-lg'>
            <button className='rounded-3xl bg-amber-300 hover:bg-amber-400 px-3'>
              <Link to="/login">
                Login
              </Link>             
                
            </button>
          </div>

        </div>
    </header>
  )
}

export default Header