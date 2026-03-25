import { BrowserRouter, Routes, Route } from "react-router-dom";
import "./styles/global.css";
import { ToastContainer } from "react-toastify";
import { Navigate } from 'react-router-dom';
import Header from "./components/Header/Header";
import Home from "./components/Home/home";
import Register from "./components/Auth/register/Register";
import Login from "./components/Auth/Login/Login";
import { AuthProvider } from "./components/context/AuthContext";
import SendEmail from "./components/Auth/sendEmail/SendEmail";
import ConfirmMdp from "./components/Auth/confirmMdp/ConfirmMdp";
import Otp from "./components/Auth/Otp/Otp";
import ProtectedRoute from "./components/Protected/ProtectedRoute";

const App = () => {
  return (
    <>
      <BrowserRouter>
        <AuthProvider>
          <Header />
          <Routes>
            <Route
              path="/"
              element={
                <ProtectedRoute>
                  <Home />
                </ProtectedRoute>
              }
            ></Route>
                

            {/* les route non proteger */}
            <Route path="/register" element={<Register />}></Route>
            <Route path="/login" element={<Login />}></Route>
            <Route path="/sendEmail" element={<SendEmail />}></Route>
            <Route path="/ConfirmMdp/:token" element={<ConfirmMdp />}></Route>
            <Route path="/otp" element={<Otp />}></Route>



                  {/* Redirection par défaut */}
            <Route path="/" element={<Navigate to="/login" replace />} />

            {/* Page 404 */}
            <Route path="*" element={<Navigate to="/login" replace />} />
          </Routes>
        </AuthProvider>
      </BrowserRouter>  
    </>
  );
};

export default App;
