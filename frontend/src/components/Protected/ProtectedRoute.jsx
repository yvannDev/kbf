import { Navigate } from 'react-router-dom';
import { UseAuth } from '../context/AuthContext';

import React from 'react'

const ProtectedRoute = ({children}) => {
    const {isAuthenticated}= UseAuth()
                // reserver au  chargement plus tard

                  // Si pas authentifié, rediriger vers login
if(!isAuthenticated){
    return <Navigate to={"/login"} replace/>
}

// si authentifier : on affiche la page 
return children
}

export default ProtectedRoute