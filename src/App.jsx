import React, { createContext, useEffect, useState } from "react";
import { Route, Routes, useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { ToastContainer } from "react-toastify";
import { clearUser, setUser } from "@/store/userSlice";
import Login from "@/components/pages/Login";
import Signup from "@/components/pages/Signup";
import Callback from "@/components/pages/Callback";
import ErrorPage from "@/components/pages/ErrorPage";
import ResetPassword from "@/components/pages/ResetPassword";
import PromptPassword from "@/components/pages/PromptPassword";
import ApperIcon from "@/components/ApperIcon";
import Button from "@/components/atoms/Button";
import TaskManagement from "@/components/pages/TaskManagement";

export const AuthContext = createContext(null)
function App() {
  const navigate = useNavigate()
  const dispatch = useDispatch()
  const [isInitialized, setIsInitialized] = useState(false)
  
  const userState = useSelector((state) => state.user)
  const isAuthenticated = userState?.isAuthenticated || false
  const user = userState?.user

  useEffect(() => {
    const { ApperClient, ApperUI } = window.ApperSDK

    const client = new ApperClient({
      apperProjectId: import.meta.env.VITE_APPER_PROJECT_ID,
      apperPublicKey: import.meta.env.VITE_APPER_PUBLIC_KEY
    })

    ApperUI.setup(client, {
      target: '#authentication',
      clientId: import.meta.env.VITE_APPER_PROJECT_ID,
      view: 'both',
      onSuccess: function (user) {
        setIsInitialized(true)
        let currentPath = window.location.pathname + window.location.search
        let redirectPath = new URLSearchParams(window.location.search).get('redirect')
        const isAuthPage = currentPath.includes('/login') || currentPath.includes('/signup') || 
                           currentPath.includes('/callback') || currentPath.includes('/error') || 
                           currentPath.includes('/prompt-password') || currentPath.includes('/reset-password')
        
        if (user) {
          if (redirectPath) {
            navigate(redirectPath)
          } else if (!isAuthPage) {
            if (!currentPath.includes('/login') && !currentPath.includes('/signup')) {
              navigate(currentPath)
            } else {
              navigate('/')
            }
          } else {
            navigate('/')
          }
          dispatch(setUser(JSON.parse(JSON.stringify(user))))
        } else {
          if (!isAuthPage) {
            navigate(
              currentPath.includes('/signup')
                ? `/signup?redirect=${currentPath}`
                : currentPath.includes('/login')
                ? `/login?redirect=${currentPath}`
                : '/login'
            )
          } else if (redirectPath) {
            if (
              !['error', 'signup', 'login', 'callback', 'prompt-password', 'reset-password'].some((path) => currentPath.includes(path))
            ) {
              navigate(`/login?redirect=${redirectPath}`)
            } else {
              navigate(currentPath)
            }
          } else if (isAuthPage) {
            navigate(currentPath)
          } else {
            navigate('/login')
          }
          dispatch(clearUser())
        }
      },
      onError: function(error) {
        console.error("Authentication failed:", error)
      }
    })
  }, [])

  const authMethods = {
    isInitialized,
    logout: async () => {
      try {
        const { ApperUI } = window.ApperSDK
        await ApperUI.logout()
        dispatch(clearUser())
        navigate('/login')
      } catch (error) {
        console.error("Logout failed:", error)
      }
    }
  }

  if (!isInitialized) {
    return (
      <div className="loading flex items-center justify-center p-6 h-screen w-full">
        <svg className="animate-spin" xmlns="http://www.w3.org/2000/svg" width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M12 2v4"></path><path d="m16.2 7.8 2.9-2.9"></path><path d="M18 12h4"></path><path d="m16.2 16.2 2.9 2.9"></path><path d="M12 18v4"></path><path d="m4.9 19.1 2.9-2.9"></path><path d="M2 12h4"></path><path d="m4.9 4.9 2.9 2.9"></path>
        </svg>
      </div>
    )
  }

  return (
    <AuthContext.Provider value={authMethods}>
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-100">
        {isAuthenticated && (
          <header className="bg-white shadow-sm border-b border-slate-200 px-6 py-4">
            <div className="flex items-center justify-between max-w-7xl mx-auto">
              <div className="flex items-center space-x-3">
                <div className="w-8 h-8 bg-gradient-to-r from-primary-600 to-primary-700 rounded-lg flex items-center justify-center">
                  <ApperIcon name="CheckSquare" className="w-5 h-5 text-white" />
                </div>
                <h1 className="text-xl font-bold gradient-text">TaskFlow</h1>
              </div>
              <div className="flex items-center space-x-4">
                <span className="text-sm text-slate-600">
                  Welcome, {user?.firstName || user?.emailAddress}
                </span>
                <Button 
                  variant="secondary" 
                  size="sm"
                  onClick={authMethods.logout}
                  className="flex items-center space-x-2"
                >
                  <ApperIcon name="LogOut" className="w-4 h-4" />
                  <span>Logout</span>
                </Button>
              </div>
            </div>
          </header>
        )}
        
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/signup" element={<Signup />} />
          <Route path="/callback" element={<Callback />} />
          <Route path="/error" element={<ErrorPage />} />
          <Route path="/prompt-password/:appId/:emailAddress/:provider" element={<PromptPassword />} />
          <Route path="/reset-password/:appId/:fields" element={<ResetPassword />} />
          <Route path="/" element={isAuthenticated ? <TaskManagement /> : <Login />} />
          <Route path="*" element={isAuthenticated ? <TaskManagement /> : <Login />} />
        </Routes>
      
<ToastContainer
          position="top-right"
          autoClose={3000}
          hideProgressBar={false}
          newestOnTop={false}
          closeOnClick
          rtl={false}
          pauseOnFocusLoss
          draggable
          pauseOnHover
          theme="light"
          toastStyle={{
            borderRadius: "8px",
            boxShadow: "0 10px 25px rgba(0, 0, 0, 0.1)",
            backdropFilter: "blur(10px)"
          }}
        />
</div>
    </AuthContext.Provider>
  )
}

export default App