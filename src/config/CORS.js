import cors from "cors";

const allowedOrigins = [
  "http://localhost:5173",
  "https://shophub-frontend-azure.vercel.app",
];

const corsOptions = {
  origin: function (origin, callback) {
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error("Not allowed by CORS"));
    }
  },
  credentials: true,
};

const corsMiddleware = cors(corsOptions);

export default corsMiddleware;