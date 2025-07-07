import React from 'react'
import { Link } from 'react-router-dom'

function DashBoard() {
  return (
    <header className="fixed top-0 left-0 w-full h-14 bg-gray-950 shadow-sm z-50">
        <div className='flex justify-between items-center h-full w-full px-4'>

            <div className='text-xl font-semibold text-amber-300'>
            StarkPrep
            </div >

            <div className='text-white font-semibold text-xl my-2'>
                <button className='hover:text-amber-300'><Link to="/contest-tracker">Event Tracker</Link> </button> | 
                <button className='hover:text-amber-300 '>
                    Profile Tracker
                </button>
            </div>

        </div>
    </header>
  )
}

export default DashBoard