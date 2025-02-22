const sequelize = require('../config/database');
const Subject = require('../models/subjectModel');
const path = require('path');
const fs = require('fs');
const { sendEmailToUser } = require('./resetController');

const getAllSubjects = async (req, res) =>{
    const response = await Subject.findAll({
        order: [
            ['subjectname', 'ASC']
        ]
    });
    return res.status(200).json(response);
}

const getSubjectById = async (req, res) =>{
    const response = await Subject.findByPk(req.params.id);
    return res.status(200).json(response);
}

const createSubject = async (req, res) =>{
    const { subjectname } = req.body;
    try{
        const subjectAlreadyExists = await Subject.findOne({
        where: {
            subjectname: subjectname
        }
    });
    if(subjectAlreadyExists){
        return res.status(400).json({
            message: "Subject already exists"
        });
    }
    const response = await Subject.create(req.body);
    return res.status(200).json(response);
    }catch(error){
        /* istanbul ignore next */
        return res.status(500).json({ message: "Error creating subject" });
    }
}

const getAllSubjectsDictatedByTeachers = async (req, res) => {
    try {
      const [results] = await sequelize.query(`
        SELECT DISTINCT s.subjectid, s.subjectname
        FROM subjects s
        INNER JOIN subjectteacher st ON s.subjectid = st.subjectid
        INNER JOIN monthlyschedule sch ON st.teacherid = sch.teacherid
        WHERE sch.istaken = false
        ORDER BY s.subjectname ASC;
        `);
        
      return res.status(200).json({message: "Subjects retrieved successfully", results});
    } catch (error) {
        /* istanbul ignore next */
      return res.status(500).json({ message: 'Internal server error' });
    }
  };

const updateSubject = async (req, res) =>{
    const { class_price } = req.body;
    try{
        const subject = await Subject.findByPk(req.params.id);
        if(!subject){
            return res.status(404).json({
                message: "Subject not found"
            });
        }
        
        /* const teachers = await sequelize.query(
            `SELECT t.teacherid, t.firstname, t.lastname, t.email, s.subjectname AS subject_name
             FROM "teachers" t
             JOIN "subjectteacher" st ON t.teacherid = st.teacherid
             JOIN "subjects" s ON st.subjectid = s.subjectid
             WHERE s.subjectid = :subjectid;`,
            {
                replacements: { subjectid: subject.subjectid },
            }
        );
        const teacherList = teachers[0]
        const recipientEmails = teacherList.map(teacher => teacher.email).filter(email => email);
        if (recipientEmails.length === 0) {
            return res.status(201).json({ message: 'No teachers found for this subject' });
        }else{
            const templatePath = path.join(__dirname, '../priceUpdateTemplate.html');
            let htmlContent = fs.readFileSync(templatePath, 'utf8');

            htmlContent = htmlContent.replace(/{{subjectName}}/g, subject.subjectname)
                                    .replace(/{{newPrice}}/g, class_price);

            for (const teacher of teachers) {
                personalizedContent = htmlContent.replace(/{{teacherName}}/g, teacher.firstname + teacher.lastname);
                setImmediate(async () => {
                    try {
                        await sendEmailToUser(teacher[0].email, "Class Price Updated", personalizedContent);
                    } catch (error) {
                        console.error(`Failed to send email to ${teacher[0].email}:`, error);
                    }
                });
            }
        } */

        subject.class_price = class_price;
        const response = await subject.save();
        return res.status(200).json(response);
    }catch(error){
        /* istanbul ignore next */
        return res.status(500).json({ message: "Error updating subject" });
    }
}

const getSubjectPrice = async (req, res) =>{
    const { subjectid } = req.params;
    try{
        const subject = await Subject.findByPk(subjectid);
        if(!subject){
            return res.status(404).json({
                message: "Subject not found"
            });
        }
        return res.status(200).json(subject.class_price);
    }catch(error){
        /* istanbul ignore next */
        return res.status(500).json({ message: "Error getting subject price" });
    }
}

module.exports = {
    getAllSubjects,
    getSubjectById,
    createSubject,
    getAllSubjectsDictatedByTeachers,
    updateSubject,
    getSubjectPrice
};