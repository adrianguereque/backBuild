const express = require("express");
const { registerUser, loginUser, getUsers, getSession, logoutUser, deleteUser, updateUser } = require("../controllers/userController");
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
router.get("/getUsers", getUsers);


router.get("/getSession", getSession)

router.post("/logoutUser", logoutUser)

/**
 * @swagger
 * /users/deleteUser:
 *   delete:
 *     summary: Delete a specific user
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - email
 *             properties:
 *               email:
 *                 type: string
 *     responses:
 *       200:
 *         description: User deleted successfully
 *       400:
 *         description: Missing email
 *       500:
 *         description: Server error
 */
// router.delete("/deleteUser", auth(["admin"]), deleteUser);
router.delete("/deleteUser",deleteUser);


/**
 * @swagger
 * /users/updateUser:
 *   put:
 *     summary: Update a user
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - email
 *             properties:
 *               email:
 *                 type: string
 *               name:
 *                 type: string
 *     responses:
 *       200:
 *         description: User updated successfully
 *       400:
 *         description: Missing email
 *       500:
 *         description: Server error
 */
// router.put("/updateUser", auth(["admin"]), updateUser);
router.put("/updateUser", updateUser);


module.exports = router;
