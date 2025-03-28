const Jwt = require('jsonwebtoken');
const Dotenv = require('dotenv');

module.exports = (req, res, next) => {
    Dotenv.config();
    // En test no se controla la autorización
    if (process.env.NODE_ENV == "TEST") return next();
    if (!req.headers.authorization) return next({ status: 401, message: 'Error de autentificación. No se ha encontrado token.' });
    let token = req.headers.authorization.split(' ')[1];
    try {
        let decode = Jwt.verify(token, process.env.ARIPWBI_JWT_KEY);
        next();
    } catch (error) {
        next({ status: 401, message: `Fallo de autentificación.` });
    }
};
