const jwt = require('jsonwebtoken');

const verifyToken = (req, res, next) => {
    const token = req.cookies.token;
    if(!token) return res.status(401).json({message: "Unauthorized"})
    try {
        decodedToken = jwt.verify(token,process.env.JWT_SECRET);
        req.user = {id: decodedToken.id, fullname: decodedToken.fullname};
        next();
    } catch {
        return res.status(403).json({ message: "Invalid or expired token" });
    }
}

module.exports = {verifyToken}