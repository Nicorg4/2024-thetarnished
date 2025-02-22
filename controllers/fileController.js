const { Op } = require('sequelize');
const File = require('../models/fileModel');
const sequelize = require('../config/database');
const Teacher = require('../models/teacherModel');
const StudentFile = require('../models/studentFileModel');
const Student = require('../models/studentModel');
const path = require('path');
const fs = require('fs');
const { sendEmailToUser } = require('./resetController');

const uploadFile = async (req, res) => {
    try {
      const { teacher_id } = req.body;
      
      if (!teacher_id) {
        return res.status(400).json({ message: "Teacher ID is required" });
      }

      const teacherFound = await Teacher.findByPk(teacher_id);
      if (!teacherFound) {
        return res.status(404).json({ message: "Teacher not found" });
      }
      
      if (!req.file) {
        return res.status(400).json({ message: "No file uploaded" });
      }
      
      const { file } = req;
      const fileData = {
        file_path: file.path,
        filename: file.originalname,
        mime_type: file.mimetype,
        size: file.size,
        created_at: new Date(),
        teacher_id
      };
  
      const response = await File.create(fileData);
      return res.status(201).json(response);
    } catch (error) {
      console.error(error);
      return res.status(500).json({ message: "Error creating file" });
    }
  };
  
  const getFilesByStudentId = async (req, res) => {
  try {
    const { student_id } = req.params;
    
    if (!student_id) {
      return res.status(400).json({ message: 'Student ID is required in the URL parameters' });
    }
    
    const studentFound = await Student.findByPk(student_id);
    if (!studentFound) {
      return res.status(404).json({ message: 'Student not found' });
    }
    
    const studentFiles = await StudentFile.findAll({
      where: { student_id },
      attributes: ['file_id']
    });
  
    if (!studentFiles.length) {
      return res.status(404).json({ message: 'No files found for this student' });
    }
  
    const fileIds = studentFiles.map(record => record.file_id);
  
    const files = await File.findAll({
      where: {
        id: fileIds
      }
    });

    const baseUrl = `${req.protocol}://${req.get('host')}`;
    const filesWithUrl = files.map(file => ({
      ...file.toJSON(),
      url: `${baseUrl}/${file.file_path.replace(/\\/g, '/')}`
    }));
  
    return res.status(200).json({ files: filesWithUrl });
  } catch (error) {
    console.error('Error retrieving files for student:', error);
    return res.status(500).json({ message: 'Error retrieving files' });
  }
};


const assignFileToStudent = async (req, res) => {
  try {
    const { student_id, file_id } = req.params;

    if (!student_id || !file_id) {
      return res.status(400).json({ message: "Both student_id and file_id are required." });
    }

    const student = await Student.findByPk(student_id);
    if (!student) {
      return res.status(404).json({ message: "Student not found." });
    }

    const file = await File.findByPk(file_id);
    if (!file) {
      return res.status(404).json({ message: "File not found." });
    }

    const existingAssignment = await StudentFile.findOne({
      where: { student_id, file_id }
    });

    if (existingAssignment) {
      return res.status(400).json({ message: "User already has permission to access this file." });
    }

    const assignment = await StudentFile.create({ student_id, file_id });

    const formattedDate = new Date().toLocaleString();

    const teacher = await Teacher.findByPk(file.teacher_id);
    if (!teacher) {
      return res.status(404).json({ message: "Teacher not found." });
    }
    const teacherName = `${teacher.firstname} ${teacher.lastname}`;

    const templatePath = path.join(__dirname, '../newFileSharedNotificationTemplate.html');
    let htmlContentStudent = fs.readFileSync(templatePath, 'utf8');
    const URL_SERVER = process.env.URL_SERVER;
    const url = `${URL_SERVER}/shared-notes`;
    
    htmlContentStudent = htmlContentStudent
      .replace(/{{teacherName}}/g, teacherName)
      .replace(/{{fileTitle}}/g, file.filename)
      .replace(/{{formattedDate}}/g, formattedDate)
      .replace(/{{fileLink}}/g, url);

    setImmediate(async () => {
      try {
        await sendEmailToUser(student.email, "New Study Material Shared", htmlContentStudent);
      } catch (error) {
        console.error("Error sending email:", error);
      }
    });

    return res.status(201).json({
      message: "File assigned to student successfully and email sent.",
      assignment,
    });

  } catch (error) {
    console.error("Error assigning file to student:", error);
    return res.status(500).json({ message: "Error assigning file to student." });
  }
};


  const unassignFileToStudent = async (req, res) => {
    try {
      const { student_id, file_id } = req.params;
  
      if (!student_id || !file_id) {
        return res.status(400).json({ message: "Both student_id and file_id are required." });
      }

      const student = await Student.findByPk(student_id);
      if (!student) {
        return res.status(404).json({ message: "Student not found." });
      }
  
      const file = await File.findByPk(file_id);
      if (!file) {
        return res.status(404).json({ message: "File not found." });
      }
  
      const result = await StudentFile.destroy({ where: { student_id, file_id } });
      if (result === 0) {
        return res.status(404).json({ message: "User does not have permission to access this file." });
      }
  
      return res.status(200).json({ message: "File unassigned from student successfully." });
    } catch (error) {
      console.error("Error unassigning file from student:", error);
      return res.status(500).json({ message: "Error unassigning file from student." });
    }
  };

  const downloadFileById = async (req, res) => {
    try {
      const { file_id } = req.params;
    
      const file = await File.findByPk(file_id);
      if (!file) {
        return res.status(404).json({ message: "File not found" });
      }
      
      const filePath = path.join(__dirname, '../', file.file_path);
      return res.download(filePath, file.filename, (err) => {
        if (err) {
          console.error("Error downloading file:", err);
          return res.status(500).json({ message: "Error downloading file" });
        }
      });
    } catch (error) {
      console.error("Error downloading file by id:", error);
      return res.status(500).json({ message: "Internal server error" });
    }
  };

const getAllTeacherFiles = async (req, res) => {
  try {
    const { teacher_id } = req.params;
    if (!teacher_id) {
      return res.status(400).json({ message: 'Teacher ID is required in the URL parameters' });
    }
    
    const teacherFound = await Teacher.findByPk(teacher_id);
    if (!teacherFound) {
      return res.status(404).json({ message: 'Teacher not found' });
    }

    const files = await File.findAll({
      where: {
        teacher_id: teacher_id
      }
    });

    if (!files.length) {
      return res.status(404).json({ message: 'No files found for this teacher' });
    }

    const baseUrl = `${req.protocol}://${req.get('host')}`;
    const filesWithUrl = files.map(file => ({
      ...file.toJSON(),
      url: `${baseUrl}/${file.file_path.replace(/\\/g, '/')}`
    }));
  
    return res.status(200).json({ files: filesWithUrl });
  } catch (error) {
    console.error('Error retrieving files for teacher:', error);
    return res.status(500).json({ message: 'Error retrieving files' });
  }

}
  
module.exports = {
  uploadFile,
  getFilesByStudentId,
  assignFileToStudent,
  downloadFileById,
  getAllTeacherFiles,
  unassignFileToStudent
};