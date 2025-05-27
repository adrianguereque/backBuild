const express = require("express");
const { registerUser, loginUser, getUsers, getSession, logoutUser, deleteUser, updateUser, updateUserMe, deleteUserMe } = require("../controllers/userController");
const router = express.Router();

const { auth } = require('../middleware/auth'); // Import the middleware

/**
 * @swagger
 * /users/register:
 *   post:
 *     summary: Register a new user
 *     tags: [Users]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - email
 *               - name
 *               - password
 *             properties:
 *               email:
 *                 type: string
 *               name:
 *                 type: string
 *               password:
 *                 type: string
 *     responses:
 *       201:
 *         description: User registered successfully
 *       400:
 *         description: All fields are required
 *       500:
 *         description: Server error
 */


router.post("/register", registerUser);

/**
 * @swagger
 * /users/login:
 *   post:
 *     summary: Login a user
 *     tags: [Users]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - email
 *               - password
 *             properties:
 *               email:
 *                 type: string
 *               password:
 *                 type: string
 *     responses:
 *       200:
 *         description: Login successful
 *       401:
 *         description: Invalid credentials
 *       500:
 *         description: Server error
 */

router.post("/login", loginUser);

/**
 * @swagger
 * /users/getUsers:
 *   get:
 *     summary: Obtiene todos los usuarios registrados en el sistema
 *     description: Retorna una lista completa de usuarios con sus datos básicos y estadísticas
 *     tags: [Usuarios]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Lista de usuarios obtenida exitosamente
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   email:
 *                     type: string
 *                     description: email electrónico del usuario (identificador único)
 *                   name:
 *                     type: string
 *                     description: name completo del usuario
 *                   contrasenia:
 *                     type: string
 *                     description: Contraseña encriptada del usuario
 *       401:
 *         description: No autorizado (token inválido o faltante)
 *       403:
 *         description: Prohibido (sin permisos suficientes)
 *       500:
 *         description: Error del servidor
 */

// router.get("/getUsers", auth(["admin", "dueno"]), getUsers);
router.get("/getUsers", auth(), getUsers);

/**
 * @swagger
 * /users/getSession:
 *   get:
 *     summary: Get current session token
 *     description: Returns the JWT token from the Auth cookie if authenticated
 *     tags: [Users]
 *     responses:
 *       200:
 *         description: Authenticated session
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 token:
 *                   type: string
 *                   description: JWT token
 *       401:
 *         description: Not authenticated (missing or invalid Auth cookie)
 */

router.get("/getSession", auth(), getSession)

/**
 * @swagger
 * /users/logoutUser:
 *   post:
 *     summary: Log out the current user
 *     description: Clears the Auth cookie and ends the session
 *     tags: [Users]
 *     responses:
 *       200:
 *         description: Logged out successfully
 */

router.post("/logoutUser", logoutUser)

/**
 * @swagger
 * /users/deleteUser/{id}:
 *   delete:
 *     summary: Delete a specific user by ID
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - name: id
 *         in: path
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: User deleted successfully
 *       404:
 *         description: User not found
 *       500:
 *         description: Server error
 */
router.delete("/deleteUser/:id", auth(), deleteUser);

/**
 * @swagger
 * /users/updateUser/{id}:
 *   put:
 *     summary: Update a specific user by ID
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - name: id
 *         in: path
 *         required: true
 *         schema:
 *           type: integer
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *               email:
 *                 type: string
 *               password:
 *                 type: string
 *     responses:
 *       200:
 *         description: User updated successfully
 *       400:
 *         description: Missing data or invalid ID
 *       500:
 *         description: Server error
 */
router.put("/updateUser/:id", auth(), updateUser);

/**
 * @swagger
 * /users/updateUserMe:
 *   put:
 *     summary: Update the currently authenticated user
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *               email:
 *                 type: string
 *               password:
 *                 type: string
 *     responses:
 *       200:
 *         description: User updated successfully
 *       400:
 *         description: Missing data
 *       401:
 *         description: Not authenticated or token invalid
 *       500:
 *         description: Server error
 */

router.put("/updateUserMe", auth(), updateUserMe);

/**
 * @swagger
 * /users/deleteUserMe:
 *   delete:
 *     summary: Delete the currently authenticated user
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: User deleted successfully
 *       401:
 *         description: Not authenticated or token invalid
 *       500:
 *         description: Server error
 */

router.delete("/deleteUserMe", auth(), deleteUserMe);

module.exports = router;
