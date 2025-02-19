const { Op } = require('sequelize');
const File = require('../models/fileModel');
const sequelize = require('../config/database');
const Teacher = require('../models/teacherModel');
const StudentFile = require('../models/studentFileModel');
const Student = require('../models/studentModel');

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
    
    // Verificar que el estudiante exista
    const studentFound = await Student.findByPk(student_id);
    if (!studentFound) {
      return res.status(404).json({ message: 'Student not found' });
    }
    
    // Buscar en la tabla students_files todos los file_id relacionados con el student
    const studentFiles = await StudentFile.findAll({
      where: { student_id },
      attributes: ['file_id']
    });
  
    if (!studentFiles.length) {
      return res.status(404).json({ message: 'No files found for this student' });
    }
  
    // Extraer los IDs de archivo
    const fileIds = studentFiles.map(record => record.file_id);
  
    // Buscar en la tabla files los archivos correspondientes
    const files = await File.findAll({
      where: {
        id: fileIds
      }
    });

    // Construir la URL completa para cada archivo
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

      const assignment = await StudentFile.create({ student_id, file_id });
  
      return res.status(201).json({
        message: "File assigned to student successfully.",
        assignment,
      });
    } catch (error) {
      console.error("Error assigning file to student:", error);
      return res.status(500).json({ message: "Error assigning file to student." });
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
  
module.exports = {
  uploadFile,
  getFilesByStudentId,
  assignFileToStudent,
  downloadFileById
};