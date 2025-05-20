const { pool } = require("../config/db");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

const registerUser = async (req, res) => {
  const { email, name, password, role} = req.body;

  if (!email || !name || !password) {
    return res.status(400).json({ error: "All fields are required" });
  }

  try {
    const passwordHash = await bcrypt.hash(password, 10);
    const query = `
      INSERT INTO users 
      (email, name, password, role)
      VALUES (?, ?, ?, ?)
    `;
    const params = [email, name, passwordHash, role];

    pool.query(query, params, (err, results) => {
      if (err) {
        console.error("Insert Error:", err);
        return res.status(500).json({ error: "Server error" });
      }
      res.status(201).json({ message: "User registered successfully" });
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Server error" });
  }
};

const loginUser = async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ error: "All fields are required" });
  }

  try {
    const query = "SELECT email, name, password, role FROM users WHERE email = ?";
    const params = [email];

    pool.query(query, params, async (err, results) => {
      if (err) {
        console.error("Query Error:", err);
        return res.status(500).json({ error: "Server error" });
      }

      if (!results || results.length === 0) {
        return res.status(404).json({ error: "Email or password incorrect" });
      }

      const user = results[0];
      const passwordMatch = await bcrypt.compare(password, user.password);

      if (!passwordMatch) {
        return res.status(401).json({ error: "Email or password incorrect" });
      }

      const token = jwt.sign(
        {
          email: user.email,
          role: user.role,
        },
        process.env.JWT_SECRET,
        { expiresIn: "1h" }
      );

      res.cookie("Auth", token, {
        httpOnly: true,
        secure: false,
        sameSite: "Lax",
        maxAge: 3600000
      });

      res.cookie("UserData", JSON.stringify({
        email: user.email,
        role: user.role,
        name: user.name
      }), {
        httpOnly: false,
        secure: false,
        sameSite: "Lax",
        maxAge: 3600000
      });

      return res.json({ message: "Login successful" });
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: "Server error" });
  }
};

const getUsers = async (req, res) => {
  try {
    const query = `
      SELECT
        id,
        email,
        name,
        role
      FROM users
    `;

    pool.query(query, (err, results) => {
      if (err) {
        console.error("Error al obtener los users:", err);
        return res.status(500).json({ error: "Error al obtener los users" });
      }

      if (!Array.isArray(results)) {
        return res.status(500).json({ error: "El formato de los datos es incorrecto" });
      }

      const formatted = results.map(usuario => ({
        id: usuario.id,
        email: usuario.email,
        name: usuario.name,
        role: usuario.role,
      }));

      res.status(200).json(formatted);
    });
  } catch (error) {
    console.error("Error general:", error);
    res.status(500).json({ error: "Error del servidor" });
  }
};

const deleteUser = async (req, res) => {
  const { email } = req.body;

  if (!email) {
    return res.status(400).json({ error: "Necesitas un email" });
  }

  try {
    const query = "DELETE FROM users WHERE email = ?";
    pool.query(query, [email], (err, result) => {
      if (err) {
        console.error("Error eliminando usuario:", err);
        return res.status(500).json({ error: "Error servidor" });
      }
      res.status(200).json({ message: "Borrado exitoso" });
    });
  } catch (error) {
    console.error("Error borrando usuario:", error);
    res.status(500).json({ error: "Error en el servidor" });
  }
};

const updateUser = async (req, res) => {
  const { email, name, role } = req.body;

  if (!email) {
    return res.status(400).json({ error: "Email is required" });
  }

  try {
    const query = `
      UPDATE users 
      SET name = ?, role = ?
      WHERE email = ?
    `;
    pool.query(query, [name, role, email], (err, result) => {
      if (err) {
        console.error("Error actualizando:", err);
        return res.status(500).json({ error: "Error servidor" });
      }
      res.status(200).json({ message: "Se actualizó bien" });
    });
  } catch (error) {
    console.error("Error actualizando:", error);
    res.status(500).json({ error: "Error servidor" });
  }
};

const getSession = async (req, res) => {
  const token = req.cookies.Auth;
  if (!token) return res.status(401).json({ error: "Not authenticated" });

  return res.json({ token });
};

const logoutUser = async (req, res) => {
  res.clearCookie("Auth", { path: "/", httpOnly: true, secure: false, sameSite: "Lax" });
  res.status(200).json({ message: "Sesión cerrada" });
};

module.exports = { registerUser, loginUser, getUsers, getSession, logoutUser, deleteUser, updateUser };
