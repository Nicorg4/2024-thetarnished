const bcrypt = require('bcrypt');
const Student = require('../models/studentModel');
const Teacher = require('../models/teacherModel');
const jwt = require('jsonwebtoken');
require('dotenv').config()
const nodemailer = require('nodemailer')
const sequelize = require('../config/database');
const { QueryTypes } = require('sequelize');
const { google } = require('googleapis');

const CLIENT_ID = process.env.CLIENT_ID
const CLIENT_SECRET = process.env.CLIENT_SECRET
const REDIRECT_URI = process.env.REDIRECT_URI
const REFRESH_TOKEN = process.env.REFRESH_TOKEN

const oAuth2Client = new google.auth.OAuth2(CLIENT_ID, CLIENT_SECRET, REDIRECT_URI)
oAuth2Client.setCredentials({ refresh_token: REFRESH_TOKEN})

const postForgotPassword = async (req, res) => {
    try{
        const email = req.body.email;
        const student = await Student.findOne({ where: { email: email } });
        const teacher = await Teacher.findOne({ where: { email: email } });
        if (!student && !teacher) {
            return res.status(404).json({ message: 'User not found' });
        }
        const foundUser = student ? student : teacher;
        const secret = process.env.JWT_SECRET + foundUser.password;
        const payload = {
            email: email,
            id: foundUser.studentid || foundUser.teacherid
        };
        const token = jwt.sign(payload, secret, { expiresIn: '15m' });
        const resetLink = `http://localhost:5173/reset-password/${payload.id}/${token}`;
        console.log(resetLink);
        await sendEmailToUser(email, 'Password reset link', `Click on the following link to reset your password: ${resetLink}`);
        res.status(200).json({ message: 'Password reset link has been sent to your email' });

    }catch(error){
        /*istanbul ignore next*/
        res.status(500).json({ message: 'Internal server error' });
    }
};

const getResetPassword = async (req, res) => {
    const { id, token } = req.params;
    
    try {
        const student = await Student.findOne({ where: { studentid: id } });
        const teacher = await Teacher.findOne({ where: { teacherid: id } });
        
        if (!student && !teacher) {
            return res.status(404).json({ message: 'User not found' });
        }
        const foundUser = student || teacher;

        const secret = process.env.JWT_SECRET + foundUser.password;

        const payload = jwt.verify(token, secret);

        return res.status(200).json({
            message: 'Valid Credentials',
            email: foundUser.email,
            id: foundUser.studentid || foundUser.teacherid,
            role: foundUser.role
        });

    } catch (err) {
        return res.status(400).json({ message: 'Invalid token' });
    }
};

const postResetPassword = async (req, res) => {


    const { id, token } = req.params;
    const { newPassword } = req.body;

    try {
        const student = await Student.findOne({ where: { studentid: id } });
        const teacher = await Teacher.findOne({ where: { teacherid: id } });

        if (!student && !teacher) {
            return res.status(404).json({ message: 'User not found' });
        }

        const foundUser = student || teacher;
        const secret = process.env.JWT_SECRET + foundUser.password;

        const payload = jwt.verify(token, secret);

        const hashedPassword = await bcrypt.hash(newPassword, 10);

        if (student) {
            await Student.update({ password: hashedPassword }, { where: { studentid: id } });
        } else {
            await Teacher.update({ password: hashedPassword }, { where: { teacherid: id } });
        }

        return res.status(200).json({ message: 'Password reset successful' });

    } catch (err) {
        
        return res.status(500).json({ message: 'Internal server error' });
    }
};

const sendEmailToUser = async (email, subject, message) => {

    try {
        const query = `
            SELECT * FROM (
            SELECT studentid, firstname, lastname, email, 'STUDENT' as role FROM students
            UNION ALL
            SELECT teacherid, firstname, lastname, email, 'TEACHER' as role FROM teachers
            ) as users
            WHERE email = ? LIMIT 1;
        `;
          
        const [user] = await sequelize.query(query, {
            replacements: [email],
            type: QueryTypes.SELECT
        });

        if (!user) {
            throw new Error('User not found');
        }
        
        const accessToken = await oAuth2Client.getAccessToken();
        
        const transport = nodemailer.createTransport({
            service: 'gmail',
            auth: {
                type: 'Oauth2',
                user: 'linkandlearnonline@gmail.com',
                clientId: CLIENT_ID,
                clientSecret: CLIENT_SECRET,
                refreshToken: REFRESH_TOKEN,
                accessToken: accessToken,
            },
        });

        const mailOptions = {
            from: 'Link and Learn <linkandlearnonline@gmail.com>',
            to: email,
            subject: subject,
            text: message,
        };

        const result = await transport.sendMail(mailOptions);
        return result;
    } catch (error) {
        throw error;
    }
};

module.exports = { postForgotPassword, getResetPassword, postResetPassword}