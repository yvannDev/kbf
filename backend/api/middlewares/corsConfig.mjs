import cors from "cors";

// Configuration CORS pour Vite (port 5173)
const corsConfig = cors({
  origin: ["http://localhost:5173"],
  credentials: true,
  methods: ["GET", "POST", "PUT", "DELETE"],
  allowedHeaders: ["Content-Type", "Authorization"]
});

export default corsConfig;    