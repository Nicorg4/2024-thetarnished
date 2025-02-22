require('dotenv').config();
const { google } = require('googleapis');
const Reservation = require('../models/reservationModel');
const Meeting = require('../models/meetingModel');
const path = require('path');
const fs = require('fs');
const { sendEmailToUser } = require('./resetController');

const CLIENT_ID = process.env.CLIENT_ID;
const CLIENT_SECRET = process.env.CLIENT_SECRET;
const REDIRECT_URI = process.env.REDIRECT_URI;
const REFRESH_TOKEN = process.env.REFRESH_TOKEN;

const oAuth2Client = new google.auth.OAuth2(CLIENT_ID, CLIENT_SECRET, REDIRECT_URI);
oAuth2Client.setCredentials({ refresh_token: REFRESH_TOKEN });

const calendar = google.calendar({ version: 'v3', auth: oAuth2Client });

const createMeeting = async (req, res) => {
    try {
        const { reservationId, startTime, endTime, studentEmails, teacherEmail, subjectName } = req.body;
        const reservation = await Reservation.findByPk(reservationId);
        if (!reservation) {
            return res.status(404).json({ error: 'Reservation not found' });
        }

        const event = {
            summary: `Class: ${subjectName}`,
            description: 'Class scheduled through the Link & Learn web app.',
            start: { dateTime: startTime, timeZone: 'America/Argentina/Buenos_Aires' },
            end: { dateTime: endTime, timeZone: 'America/Argentina/Buenos_Aires' },
            conferenceData: {
                createRequest: {
                    requestId: `meet-${Date.now()}`,
                    conferenceSolutionKey: { type: 'hangoutsMeet' },
                },
            },
            attendees: [
                { email: teacherEmail },
                ...studentEmails.map(email => ({ email })),
            ],
            sendUpdates: 'all'
        };

        const response = await calendar.events.insert({
            calendarId: 'primary',
            resource: event,
            conferenceDataVersion: 1,
        });

        const meetLink = response.data.hangoutLink;

        if (!meetLink) {
            throw new Error("Google Meet link could not be generated");
        }

        const newMeeting = await Meeting.create({
            meet_id: response.data.id,
            meet_link: meetLink,
            start_time: startTime,
            end_time: endTime,
        });

        await reservation.update({ meeting_id: newMeeting.id });

        const templatePath = path.join(__dirname, '../newMeetingCreatedTemplate.html');
        let emailTemplate = fs.readFileSync(templatePath, 'utf8');

        emailTemplate = emailTemplate
            .replace('{{teacherName}}', teacherEmail)
            .replace('{{subjectName}}', subjectName)
            .replace('{{datetime}}', startTime)
            .replace('{{meetingLink}}', newMeeting.meet_link);

        setImmediate(async () => {
            try {
                sendEmailToUser(teacherEmail, "Meeting Notification", emailTemplate);
                studentEmails.forEach(email => {
                    sendEmailToUser(email, "Meeting Notification", emailTemplate);
                });
            } catch (error) {
                console.error('Error sending email:', error);
            }
        });

        res.status(201).json({ message: 'Meeting successfully created', meeting: newMeeting });
    } catch (error) {
        console.error('Error creating meeting:', error.response ? error.response.data : error.message);
        res.status(500).json({ error: 'Could not create the meeting' });
    }
};



module.exports = { createMeeting };
