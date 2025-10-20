const jwt = require('jsonwebtoken');

const verifyToken = (req, res, next) => {
    const authHeader = req.headers.authorization;
    if(!authHeader) {
        return res.status(401).json({message : "no authoriztion header"});
    }

    const token = authHeader.split(" ")[1];
    try {
        decodedToken = jwt.verify(token,process.env.JWT_SECRET);
        req.user = {id: decodedToken.id, username: decodedToken.username};
        next();
    } catch {
        return res.status(403).json({ message: "Invalid or expired token" });
    }
}

module.exports = {verifyToken}