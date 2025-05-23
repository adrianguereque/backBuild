const { sql, connectDB } = require("../config/db");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

const registerUser = async (req, res) => {
  const { email, name, password } = req.body;

  if (!email || !name || !password) {
    return res.status(400).json({ error: "All fields are required" });
  }

  try {
    const passwordHash = await bcrypt.hash(password, 10);
    const pool = await connectDB();

    await pool.request()
      .input("email", sql.VarChar, email)
      .input("name", sql.VarChar, name)
      .input("password", sql.VarChar, passwordHash)
      .query(`
        INSERT INTO UsersAdrian (email, name, password)
        VALUES (@email, @name, @password)
      `);

    res.status(201).json({ message: "User registered successfully" });
  } catch (err) {
    console.error("Insert Error:", err);
    res.status(500).json({ error: "Server error" });
  }
};

const loginUser = async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ error: "All fields are required" });
  }

  try {
    const pool = await connectDB();

    const result = await pool.request()
      .input("email", sql.VarChar, email)
      .query(`
        SELECT email, name, password
        FROM UsersAdrian
        WHERE email = @email
      `);

    const user = result.recordset[0];

    if (!user) {
      return res.status(404).json({ error: "Email or password incorrect" });
    }

    const passwordMatch = await bcrypt.compare(password, user.password);
    if (!passwordMatch) {
      return res.status(401).json({ error: "Email or password incorrect" });
    }

    const token = jwt.sign(
      { email: user.email },
      process.env.JWT_SECRET,
      { expiresIn: "1h" }
    );

    res.cookie("Auth", token, {
      httpOnly: true,
      secure: true, // must be true for SameSite: 'None'
      sameSite: "None", // allow cross-site cookies
      maxAge: 3600000
    });

    res.cookie("UserData", JSON.stringify({
      email: user.email,
      name: user.name
    }), {
      httpOnly: false,
      secure: true, // 🔒
      sameSite: "None", // 🌐
      maxAge: 3600000
    });


    res.json({ message: "Login successful" });
  } catch (err) {
    console.error("Login error:", err);
    res.status(500).json({ error: "Server error" });
  }
};

const getUsers = async (req, res) => {
  try {
    const pool = await connectDB();

    const result = await pool.request().query(`
      SELECT id, email, name FROM UsersAdrian
    `);

    const formatted = result.recordset.map(user => ({
      id: user.id,
      email: user.email,
      name: user.name
    }));

    res.status(200).json(formatted);
  } catch (err) {
    console.error("Error getting UsersAdrian:", err);
    res.status(500).json({ error: "Server error" });
  }
};

const deleteUser = async (req, res) => {
  const { email } = req.body;

  if (!email) {
    return res.status(400).json({ error: "Email is required" });
  }

  try {
    const pool = await connectDB();

    await pool.request()
      .input("email", sql.VarChar, email)
      .query("DELETE FROM UsersAdrian WHERE email = @email");

    res.status(200).json({ message: "User deleted successfully" });
  } catch (err) {
    console.error("Error deleting user:", err);
    res.status(500).json({ error: "Server error" });
  }
};

const updateUser = async (req, res) => {
  const { email, name } = req.body;

  if (!email) {
    return res.status(400).json({ error: "Email is required" });
  }

  try {
    const pool = await connectDB();

    await pool.request()
      .input("email", sql.VarChar, email)
      .input("name", sql.VarChar, name)
      .query(`
        UPDATE UsersAdrian
        SET name = @name
        WHERE email = @email
      `);

    res.status(200).json({ message: "User updated successfully" });
  } catch (err) {
    console.error("Error updating user:", err);
    res.status(500).json({ error: "Server error" });
  }
};

const getSession = async (req, res) => {
  const token = req.cookies.Auth;
  if (!token) return res.status(401).json({ error: "Not authenticated" });

  return res.json({ token });
};

const logoutUser = async (req, res) => {
  res.clearCookie("Auth", { path: "/", httpOnly: true, secure: false, sameSite: "Lax" });
  res.status(200).json({ message: "Logged out successfully" });
};

module.exports = {
  registerUser,
  loginUser,
  getUsers,
  getSession,
  logoutUser,
  deleteUser,
  updateUser
};
