import mongoose from "mongoose";

mongoose.set("strictQuery", true);
mongoose.connect("mongodb://127.0.0.1:27017/wetube");

// db 성공여부 start
const db = mongoose.connection;

const handleOpen = () => console.log("✅ Connected to DB");
const handleError = (error) => console.log("❌ DB Error", error);
db.on("error", handleError);
db.once("open", handleOpen);
// db 성공여부 end
