import bcrypt from "bcrypt";
import mongoose from "mongoose";

const userSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  username: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  location: String,
});

userSchema.pre("save", async function () {
  console.log("Users password:", this.password);
  // this.password: 유저가 입력한 password
  this.password = await bcrypt.hash(this.password, 5);
  console.log("Hashed password:", this.password);
});

const User = mongoose.model("User", userSchema);

export default User;
