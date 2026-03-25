import { createContext,useContext,useState,useEffect} from "react";
const AuthContext = createContext()

export const AuthProvider =({children})=>{
     const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [user, setUser] = useState(null);
  const [loading,setLoading]=useState(false)
//   verifier si l'utilisateur est connecter au chargement
useEffect(()=>{
              const token = localStorage.getItem("tokrn")
              const useInfos =localStorage.getItem("user")

              if(token&&useInfos){
                setIsAuthenticated(true)
                setUser(JSON.parse(useInfos))
              }

              setLoading(false)
},[])

// la fonction de connexion
   const login =(token, userData)=>{
            localStorage.setItem("token",token)
            localStorage.setItem("user",JSON.stringify(userData))
            setIsAuthenticated(true)
            setUser(userData)
   }

//     la fonction de deconnexion

const logout =()=>{
     localStorage.removeItem("token")
            localStorage.removeItem("user")
            setIsAuthenticated(false)
            setUser(null)
};

return (
    <AuthContext.Provider  value={{isAuthenticated,user,login,logout,loading}}>
        {children}
    </AuthContext.Provider>
)
  
}

 export const UseAuth =()=>{
    const context = useContext(AuthContext);
    if(!context){
    throw new Error("useAuth doit être utilisé dans AuthProvider");
    }
      return context; 
  }