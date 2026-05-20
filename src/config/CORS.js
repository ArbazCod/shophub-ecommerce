import cors from "cors";

const corsOptions = {
  origin: process.env.FRONTEND_URL || "http://localhost:5173",
  credentials: true,
};

const corsMiddleware = cors(corsOptions);

export default corsMiddleware;