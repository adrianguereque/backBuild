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
        SELECT email, name, password, id
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
      { email: user.email, id: user.id },
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
      secure: true, // 
      sameSite: "None", // 
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
  const { id } = req.params;

  try {
    const pool = await connectDB();
    const result = await pool.request()
      .input("id", sql.Int, id)
      .query("DELETE FROM UsersAdrian WHERE id = @id");

    if (result.rowsAffected[0] === 0) {
      return res.status(404).json({ error: "User not found" });
    }

    res.status(200).json({ message: "User deleted successfully" });
  } catch (err) {
    console.error("Error deleting user:", err);
    res.status(500).json({ error: "Server error" });
  }
};

const updateUser = async (req, res) => {
  const { id } = req.params;
  const { name, email, password } = req.body;

  if (!name && !email && !password) {
    return res.status(400).json({ error: "At least one field (name, email, or password) must be provided" });
  }

  try {
    const pool = await connectDB();

    let updateFields = [];
    if (name) updateFields.push("name = @name");
    if (email) updateFields.push("email = @email");
    if (password) updateFields.push("password = @password"); // In production, hash this!

    const query = `
      UPDATE UsersAdrian
      SET ${updateFields.join(", ")}
      WHERE id = @id
    `;

    const request = pool.request().input("id", sql.Int, id);
    if (name) request.input("name", sql.VarChar, name);
    if (email) request.input("email", sql.VarChar, email);
    if (password) {
      const hashedPassword = await bcrypt.hash(password, 10);
      request.input("password", sql.VarChar, hashedPassword);
    }


    const result = await request.query(query);

    if (result.rowsAffected[0] === 0) {
      return res.status(404).json({ error: "User not found" });
    }

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
  res.clearCookie("UserData", { path: "/", httpOnly: false, secure: true, sameSite: "None" });

  res.status(200).json({ message: "Logged out successfully" });
};

const updateUserMe = async (req, res) => {
  const token = req.cookies?.Auth;

  if (!token) {
    return res.status(401).json({ message: "No autenticado" });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.params.id = decoded.id; // Inject into req.params for reuse
    await updateUser(req, res); // Reuse main update function
  } catch (error) {
    console.error("Token inválido:", error);
    res.status(401).json({ message: "Token inválido o expirado" });
  }
};

const deleteUserMe = async (req, res) => {
  const token = req.cookies?.Auth;

  if (!token) {
    return res.status(401).json({ message: "No autenticado" });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.params.id = decoded.id; 
    await deleteUser(req, res); 
  } catch (error) {
    console.error("Token inválido:", error);
    res.status(401).json({ message: "Token inválido o expirado" });
  }
};

module.exports = {
  registerUser,
  loginUser,
  getUsers,
  getSession,
  logoutUser,
  deleteUser,
  updateUser,
  updateUserMe,
  deleteUserMe
};
