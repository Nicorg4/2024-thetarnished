const sequelize = require('../config/database');
const Subject = require('../models/subjectModel');

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