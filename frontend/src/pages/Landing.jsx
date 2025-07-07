import React from 'react'
import Header from '../components/Header'
import { Link } from 'react-router-dom'

function Landing() {
  return (
    <div className='min-h-screen bg-gray-900 text-white'>

        <Header/>

        {/* {Center Content} */}
        <div className='flex items-center justify-center mt-16 min-w-full'>
            <div className='text-center space-y-6 mt-6'>
                <h1 className='text-6xl font-bold text-amber-400'>Welcome to StarkPrep</h1>
                <p className="text-2xl ">Your one-stop solution for tech prep and tracking!</p>
                <p>
                    Now keep track of your coding journey at a single place.
                </p>
                
                    <button className="bg-amber-300 text-black font-semibold px-6 py-2 rounded-full hover:bg-amber-400 transition duration-200">
                        <Link to="/register">
                            Get Started
                        </Link>
                        
                    </button>
                
                    
                
                <div className='flex justify-center'>
                <img src='./public/coding.jpg'
                className='mx-auto w-80 sm:w-100 md:w-120 lg:w-120 rounded-2xl'
                />
                </div>
            </div>
            
            
        </div>

    </div>
    
  )
}

export default Landing