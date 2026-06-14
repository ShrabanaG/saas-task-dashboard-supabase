import React from "react";
import { Navigate } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";

const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
    const {session, loading} = useAuth();

    if(loading) {
        return (
            <div className="min-h-screen bg-gray-950 flex items-center justify-center">
                <div className="text-gray-400">Loading...</div>
            </div>
        )
    }

    if(!session) return <Navigate to="/login"></Navigate>

    return (
        <>{children}</>
    )
}

export default ProtectedRoute;