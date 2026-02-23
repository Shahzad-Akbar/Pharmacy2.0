import jwt from 'jsonwebtoken';


export const generateTokenAndSetCookie = (userId, role, res) => {
    const token = jwt.sign({ userId, role }, process.env.JWT_SECRET, {
        expiresIn: '15d'
    });

    res.cookie('jwt', token, {
        maxAge: 15 * 24 * 60 * 60 * 1000,
        httpOnly: true,  // it will prevent from xss attacks
        sameSite: 'lax', // Use 'lax' for better compatibility with redirects
        secure: process.env.NODE_ENV === 'production'
    });

    // Also set a role cookie for middleware to use
    res.cookie('role', role, {
        maxAge: 15 * 24 * 60 * 60 * 1000,
        httpOnly: false, // Allow frontend/middleware to read
        sameSite: 'lax',
        secure: process.env.NODE_ENV === 'production'
    });
}