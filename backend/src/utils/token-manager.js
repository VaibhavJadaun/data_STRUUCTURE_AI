import jwt from "jsonwebtoken";
import { COOKIE_NAME } from "./constants.js";
function getJwtSecret() {
    const s = process.env.JWT_SECRET?.trim();
    if (!s)
        throw new Error("JWT_SECRET is not set");
    return s;
}
export const createToken = (id, email, expiresIn) => {
    const payload = { id, email };
    return jwt.sign(payload, getJwtSecret(), {
        expiresIn,
    });
};
export const verifyToken = async (req, res, next) => {
    const token = req.signedCookies[`${COOKIE_NAME}`];
    if (!token || token.trim() === "") {
        return res.status(401).json({ message: "Token Not Received" });
    }
    return new Promise((resolve, reject) => {
        return jwt.verify(token, getJwtSecret(), (err, success) => {
            if (err) {
                reject(err.message);
                return res.status(401).json({ message: "Token Expired" });
            }
            else {
                resolve();
                res.locals.jwtData = success;
                return next();
            }
        });
    });
};
//# sourceMappingURL=token-manager.js.map