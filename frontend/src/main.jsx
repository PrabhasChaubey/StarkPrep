import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'
import { createBrowserRouter } from 'react-router-dom'
import Landing from './pages/Landing.jsx'
import Register from './pages/Register.jsx'
import Login from './pages/Login.jsx'
import { BrowserRouter } from 'react-router-dom'

// const router=createBrowserRouter([
//   {
//     path:"/",
//     element:<App/>,
//     children:[
//       {
//             path: "/",
//             element: <Landing />,
//       },
//       {
//         path:"/register",
//         element:<Register/>
//       },
//       {
//         path:'/login',
//         element:<Login/>
//       }
//     ]
//   }
// ])

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <BrowserRouter>
      <App />
    </BrowserRouter>    
  </StrictMode>,
)
