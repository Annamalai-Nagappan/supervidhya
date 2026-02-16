const bcrypt = require("bcryptjs");
const db = require("../models/indexModel");
const User = db.User;
const Institution = db.Institution;
const { generateToken } = require("../helpers/tokenHelper");
const { ROLES, STATUS } = require("../utils/constants");

const registerUser = async (userData) => {
    const { full_name, email, password, role, institution_id } = userData;

    // Check if institution exists and is active
    const institution = await Institution.findByPk(institution_id);
    if (!institution) {
        throw new Error("Institution not found");
    }
    if (institution.status !== STATUS.ACTIVE) {
        throw new Error("Institution is inactive");
    }

    // Check if user exists
    const userExists = await User.findOne({ where: { email } });

    if (userExists) {
        throw new Error("User already exists");
    }

    // Hash password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // Create user
    const user = await User.create({
        full_name,
        email,
        password: hashedPassword,
        role: role || ROLES.STUDENT,
        institution_id: institution_id,
        status: STATUS.ACTIVE
    });

    if (user) {
        return {
            _id: user.id,
            full_name: user.full_name,
            email: user.email,
            role: user.role,
            institution_id: user.institution_id,
            status: user.status,
            token: generateToken(user.id, user.role),
        };
    } else {
        throw new Error("Invalid user data");
    }
};

const loginUser = async (email, password) => {
    const user = await User.findOne({ where: { email } });

    if (user && (await bcrypt.compare(password, user.password))) {
        return {
            _id: user.id,
            full_name: user.full_name,
            email: user.email,
            role: user.role,
            institution_id: user.institution_id,
            status: user.status,
            token: generateToken(user.id, user.role),
        };
    } else {
        throw new Error("Invalid credentials");
    }
};

const getUserById = async (id) => {
    return await User.findByPk(id, {
        attributes: { exclude: ['password'] }
    });
};

module.exports = {
    registerUser,
    loginUser,
    getUserById,
};
