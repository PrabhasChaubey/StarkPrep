import {useState,useEffect} from 'react'
import DashBoard from '../components/DashBoard'
import axios from 'axios';
import { fetchCurrentUser,refreshCodeforcesStats,refreshLeetcodeStats } from '../services/api';
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer } from "recharts";
import DashBoardProfile from '../components/DashBoardProfile';
import { PieChart, Pie, Cell, Legend } from 'recharts';


function Profile() {
    const [userData, setUserData] = useState(null);


    const refreshStatsAndUser = async () => {
    try {
      const initialUser = await fetchCurrentUser();

    const refreshTasks = [];

      // 1. Refresh Codeforces stats if handle exists
      if (initialUser?.profileStats?.codeforces?.handle) {
      refreshTasks.push(refreshCodeforcesStats(initialUser.profileStats.codeforces.handle));
    }

      // 2. Refresh Leetcode stats if verified
      if (initialUser?.profileStats?.leetcode?.verified) {
      refreshTasks.push(refreshLeetcodeStats());
    }

    // Wait for both refreshes in parallel
    await Promise.all(refreshTasks);

      // 3. Fetch updated user
      const updatedUser = await fetchCurrentUser();
      setUserData(updatedUser);
    } catch (err) {
      console.error("Error refreshing stats:", err);
    }
  };

    

    useEffect(() => {
    refreshStatsAndUser();
  }, []);

    const ratingData = userData?.profileStats?.codeforces?.ratingHistory?.map(entry => ({
    name: entry.contestName,
    rating: entry.rating,
    timestamp: new Date(entry.timestamp).toLocaleDateString()
  })) || []

     if (!userData) return <p className="text-white">Loading...</p>;

  const totalQuestions =
    (userData?.profileStats?.leetcode?.totalProblemsSolved || 0) +
    (userData?.profileStats?.codeforces?.problemsSolved || 0);

  const totalContests =
    (userData?.profileStats?.leetcode?.attendedContestsCount || 0) +
    (userData?.profileStats?.codeforces?.totalContests || 0);

    const getCodeforcesTitle = (rating) => {
  if (rating < 1200) return "Newbie";
  if (rating < 1400) return "Pupil";
  if (rating < 1600) return "Specialist";
  if (rating < 1900) return "Expert";
  if (rating < 2100) return "Candidate Master";
  if (rating < 2300) return "Master";
  if (rating < 2400) return "International Master";
  if (rating < 2600) return "Grandmaster";
  if (rating < 3000) return "International Grandmaster";
  return "Legendary Grandmaster";
};

    //Extracting Codeforces data
    const codeforcesStats = userData?.profileStats?.codeforces;
    const currentRating = codeforcesStats?.rating || 0;
    const maxRating = codeforcesStats?.maxRating || 0;
    const problemsSolved = codeforcesStats?.problemsSolved || 0;
    const cfTitle = getCodeforcesTitle(currentRating);
    const leetcodeStats = userData?.profileStats?.leetcode;

    //Extracting Leetcode data
    const lcRating = leetcodeStats?.contestRating || 0;
    const lcContests = leetcodeStats?.attendedContestsCount || 0;
    const lcTotalSolved = leetcodeStats?.totalProblemsSolved || 0;
    const lcEasy = leetcodeStats?.submissionStats?.easy || 0;
    const lcMedium = leetcodeStats?.submissionStats?.medium || 0;
    const lcHard = leetcodeStats?.submissionStats?.hard || 0;

    const getLeetCodeTitle = (rating) => {
        if (rating >= 2200) return "Legendary";
        if (rating >= 1850) return "Guardian";
        return "None";
    };

    const leetcodeTitle = getLeetCodeTitle(lcRating);

    //Creating Pie Chart of leetcode easy,medium and hard
    const pieData = [
    { name: 'Easy', value: lcEasy },
    { name: 'Medium', value: lcMedium },
    { name: 'Hard', value: lcHard }
    ];

    const COLORS = ['#4ade80', '#facc15', '#f87171']; // Green, Yellow, Red

    
  return (

    <div className='p-1.5 lg:p-2.5 min-h-full bg-black text-white'>

        <div className='h-16'>
            <DashBoardProfile/>
        </div>

        {/* Total questions and contets div */}
        <div className='flex space-x-2 h-36 bg-black'>

            <div className='flex flex-col p-2 w-2/5 items-center justify-center  mx-2 my-2 bg-fuchsia-800 text-center rounded-2xl'>
                <p className='text-2xl mb-3'>Total Questions</p>
                <p className='text-2xl'>{totalQuestions}</p>              
            </div>

            <div className='flex text-center p-2 w-3/5 mx-2 place-content-center bg-fuchsia-800 rounded-2xl my-2'>
                <div className=' flex flex-col w-1/5'>
                    <p className='text-lg  mb-2'>Total Contests</p>
                    <p className='text-2xl mt-1'>{totalContests}</p>
                </div>
                <div className='flex flex-col w-4/5'>
                    <div className='bg-gray-950 mb-1 items-center text-center flex justify-center h-1/2 rounded-2xl hover:bg-gray-900'>
                        <p className='my-2 mr-2'>    CodeForces :
                        </p> 
                        <p >
                            {userData?.profileStats?.codeforces?.totalContests || 0}
                        </p>
                    </div>
                    <div className='bg-gray-950 h-1/2 rounded-2xl flex items-center text-center justify-center hover:bg-gray-900'>
                        <p className='mr-2'>
                            LeetCode : 
                        </p>
                        <p>
                            {userData?.profileStats?.leetcode?.attendedContestsCount || 0}
                        </p>
                    </div>
                </div>
            </div>

        </div>
        {/* Completed */}



        {/* Rating graph and stats div for codeforces */}
        <div className='flex space-x-2 h-80 bg-black my-3'>

            <div className='w-2/3 lg:w-1/2 bg-fuchsia-800 ml-2 rounded-2xl'>
                <div className='flex flex-col w-full h-full'>

                    <div className='flex justify-center'>
                        <h2 className='text-2xl font-bold mb-4 text-gray'>Codeforces Rating Graph
                        </h2>
                    </div>
                    

                    <div className='bg-gray-900 p-4 mx-2 rounded-xl'>
                    {ratingData.length > 0 ? (
                        <ResponsiveContainer width='90%' height={220}>
                        <LineChart data={ratingData}>
                            <XAxis dataKey='timestamp' tick={{ fill: 'white', fontSize: 12 }} />
                            <YAxis domain={['auto', 'auto']} tick={{ fill: 'white', fontSize: 12 }} />
                            <Tooltip
                            contentStyle={{ backgroundColor: '#333', border: 'none' }}
                            labelStyle={{ color: '#fff' }}
                            itemStyle={{ color: '#fff' }}
                            />
                            <Line type='monotone' dataKey='rating' stroke='#facc15' strokeWidth={3} dot={{ r: 4 }} />
                        </LineChart>
                        </ResponsiveContainer>
                    ) : (
                        <p>No rating data available</p>
                    )}
                    </div>
                </div>
            </div>

            <div className='w-1/3 flex flex-col lg:w-1/2 bg-fuchsia-800 mr-2 rounded-2xl'>

                    <div className='flex justify-center mt-1'>
                        <h2 className='text-2xl font-bold mb-4 text-gray'>Codeforces Stats
                        </h2>
                    </div>
                    <div className='flex flex-col p-2 bg-black rounded-2xl h-full mx-1 my-1 text-gray-700'>
                        <div className='h-1/4 w-full '>
                            <p className='text-2xl'>Current Rating : {currentRating}</p>
                            
                        </div>
                        <div className='h-1/4 w-full'>
                            <p className='text-2xl'>Max Rating : {maxRating}</p>
                            
                        </div>
                        <div className='h-1/4 w-full'>
                            <p className='text-2xl'> Problems Solved : {problemsSolved}</p>
                            
                        </div>
                        <div className='h-1/4 w-full mt-2'>
                            <p className='text-2xl'> Title : {cfTitle}</p>
                            
                        </div>
                        
                    </div>

            </div>
        </div>
        {/* Conpleted */}



        {/* Leetcode stats */}
        <div className='h-70 bg-fuchsia-700 mx-2 my-2 mt-4 rounded-2xl flex flex-col mb-2'>

            <div className='p-2 flex justify-center'>
                <p className='text-2xl text-bold'>Leetcode Stats                    
                </p>
            </div>

            <div className='bg-amber-300 h-full rounded-2xl flex'>

                <div className='bg-gray-800 w-1/3 h-full rounded-2xl flex flex-col'>
                    <div className='flex justify-center my-1'>
                        <h1 className='text-xl'>
                        Contest Stats
                        </h1>
                    </div>
                    <div className='h-1/3 mx-1 flex justify-center'>
                        <p1>
                            Contest Rating : {lcRating}
                        </p1>
                        
                    </div>
                    <div className='h-1/3 mx-1 flex justify-center'>
                        
                        <p1>
                            Total Attended : {lcContests}
                        </p1>
                        
                    </div>
                    <div className='h-1/3 mx-1 flex justify-center'>
                        <p1>
                            Title : {leetcodeTitle}
                        </p1>
                        
                    </div>
                    
                </div>


                <div className='bg-gray-800 w-2/3 h-full rounded-2xl mx-1 flex flex-col'>
                    
                    <div className='flex justify-center my-1'>
                        <h1 className='text-xl'>
                        Problem Stats
                        </h1>
                   </div>


                    <div className='flex h-full'>

                        <div className='flex flex-col jusitfy-center w-1/2'>
                            <div className='h-1/4 mx-1 flex justify-center'>
                                Total Problems : {lcTotalSolved}
                            </div>
                            <div className='h-1/4 mx-1 flex justify-center'>
                                Easy :{lcEasy}
                            </div>
                            <div className='h-1/4 mx-1 flex justify-center'>
                                Medium :{lcMedium}
                            </div>
                            <div className='h-1/4 mx-1 flex justify-center'>
                                Hard :{lcHard}
                            </div>
                        </div>

                        <div className='bg-gray-800 w-1/2 h-full rounded-2xl flex flex-col items-center justify-center text-white'>
                            
                            <PieChart width={250} height={200}>
                                <Pie
                                data={pieData}
                                cx="50%"
                                cy="50%"
                                outerRadius={70}
                                label
                                dataKey="value"
                                >
                                {pieData.map((entry, index) => (
                                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                ))}
                                </Pie>
                                <Legend />
                            </PieChart>
                        </div>

                    </div>
                        
                </div>                   
            </div>

        </div>

    </div>
  )
}

export default Profile