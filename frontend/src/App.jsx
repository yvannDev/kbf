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
import Otp from"./components/Auth/Otp/Otp";
import Parainage from "./components/Parainage/Parainage"
import ProtectedRoute from "./components/Protected/ProtectedRoute";
import Gestion from "./components/Gestion/Gestion";
import Payment from "./components/Payment/Payment";
import Dashboard from "./components/Dashboard/Dashboard";
import Retrait from "./components/Retrait/Retrait";
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
                
             <Route path="/parainage" element={
              <Parainage/>

              } ></Route>
             <Route path="/gestion" element={
              <Gestion/>
              } ></Route>
             <Route path="/payment" element={
              <Payment/>
              } ></Route>
           
              <Route path="/dashboard" element={
             <Dashboard/>
              } ></Route>

            <Route path="/retrait" element={
              // <ProtectedRoute>
                <Retrait />
              // </ProtectedRoute>
            }></Route>
            {/* les route non proteger */}
            <Route path="/register" element={<Register />}></Route>
            <Route path="/login" element={<Login />}></Route>
            <Route path="/sendEmail" element={<SendEmail />}></Route>
            <Route path="/ConfirmMdp/:token" element={<ConfirmMdp />}></Route>
            <Route path="/otp" element={<Otp />}></Route>



                  {/* Redirection par défaut */}
            {/* <Route path="/" element={<Navigate to="/login" replace />} /> */}

            {/* Page 404 */}
            {/* <Route path="*" element={<Navigate to="/login" replace />} /> */}
          </Routes>
        </AuthProvider>
      </BrowserRouter>  
    </>
  );
};

export default App;
