import {useState,useEffect} from 'react'
import { fetchContests } from '../services/api'
import DashBoard from '../components/DashBoard'

function ContestTracker() {
    const [contests, setContests] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
    const loadContests = async () => {
      try {
        const data = await fetchContests();
        setContests(data);
      } catch (err) {
        console.error('Error fetching contests:', err);
      } finally {
        setLoading(false);
      }
    };

    loadContests();
  }, []);


  return (
    <div className='min-h-screen bg-gray-900 text-white'>

       <DashBoard/>

        <div className='h-16'>

        </div>
        {loading ? (
        <p className="text-center text-lg">Loading contests...</p>
      ) : contests.length === 0 ? (
        <p className="text-center text-lg">No upcoming contests found.</p>
      ) : (
        <div className="max-w-4xl mx-auto grid gap-6">
          {contests.map((contest, idx) => (
            <div
              key={idx}
              className="bg-gray-800 p-5 rounded-lg shadow-lg hover:shadow-xl transition-all border border-gray-700 mx-2 mb-1"
            >
              <div className="flex justify-between items-center mb-2">
                <h2 className="text-xl font-semibold text-white">{contest.name}</h2>
                <span className="text-sm px-2 py-1 rounded bg-amber-500 text-black font-medium">
                  {contest.platform.includes("codeforces") ? "Codeforces" : "LeetCode"}
                </span>
              </div>
              <p className="text-sm text-gray-300">Start: {contest.startTime}</p>
              <p className="text-sm text-gray-300">End: {contest.endTime}</p>
              <p className="text-sm text-gray-300 mb-2">Duration: {contest.duration}</p>
              <a
                href={contest.url}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-block text-amber-400 hover:underline text-sm"
              >
                View Contest &rarr;
              </a>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

export default ContestTracker