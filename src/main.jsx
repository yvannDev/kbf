import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'
import { AuthProvider } from './components/context/AuthContext.jsx'

createRoot(document.getElementById('root')).render(
  <StrictMode>
    {/* j'envelope ici */}
    <AuthProvider>
            <App />
    </AuthProvider>

  </StrictMode>,
)
