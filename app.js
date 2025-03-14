const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const cors = require('cors');
const chatSockets = require('./sockets/chatSockets');
const defineAssociations = require('./models/associations');

const studentRoutes = require('./routes/studentRoutes');
const teacherRoutes = require('./routes/teacherRoutes');
const subjectRoutes = require('./routes/subjectRoutes');
const authenticationRoutes = require('./routes/authenticationRoutes'); 
const scheduleRoutes = require('./routes/weeklyScheduleRoutes');
const resetRoutes = require('./routes/resetRoutes');
const reservationRoutes = require('./routes/reservationRoutes');
const monthlyScheduleRoutes = require('./routes/monthlyScheduleRoutes');
const adminRoutes = require('./routes/adminRoutes');
const examRoutes = require('./routes/examRoutes');
const informationRoutes = require('./routes/informationRoutes');
const quizRoutes = require('./routes/quizRoutes');
const fileRoutes = require('./routes/fileRoutes');
/* const chatRoutes = require('./routes/chatRoutes'); */
const meetingRoutes = require('./routes/meetingRoutes');
const vacationRoutes = require('./routes/vacationRoutes');

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: [
      "http://localhost:5173",
      "http://192.168.0.86:5173",
      "https://linkandlearn.fpenonori.com"
    ],
    methods: ["GET", "POST"],
  }
});

app.use(cors({
  origin: (origin, callback) => {
    if (!origin || /https:\/\/.*\.vercel\.app/.test(origin) || [
        'http://localhost:5173', 
        'http://192.168.0.86:5173', 
        'https://linkandlearn.fpenonori.com'
      ].includes(origin)
    ) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization', 'ngrok-skip-browser-warning']
}));

defineAssociations();
app.options('*', cors());

app.use(express.json());

app.use('/reset', resetRoutes);
app.use('/students', studentRoutes);
app.use('/teachers', teacherRoutes);
app.use('/authentication', authenticationRoutes);
app.use('/subject', subjectRoutes);
app.use('/schedule', scheduleRoutes);
app.use('/reservation', reservationRoutes);
app.use('/classes', monthlyScheduleRoutes);
app.use('/admins', adminRoutes);
app.use('/exam', examRoutes);
app.use('/information', informationRoutes);
app.use('/quiz', quizRoutes);
app.use('/files', fileRoutes);
app.use('/meeting', meetingRoutes);
app.use('/vacation', vacationRoutes);
/* app.use('/api/chat', chatRoutes); */

chatSockets(io);

module.exports = { app, server };
