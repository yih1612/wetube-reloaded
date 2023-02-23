import "dotenv/config";
import "./db";
import "./models/Video";
import "./models/User";
import app from "./server";

// application 실행
const PORT = 4000;

const handleListening = () =>
  console.log(`✅ Server listening on port http://localhost:${PORT} 🚀`);

app.listen(PORT, handleListening);
//
