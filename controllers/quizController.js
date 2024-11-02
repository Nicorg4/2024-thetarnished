const Student = require("../models/studentModel");
const Teacher = require("../models/teacherModel");
const cron = require("node-cron");


const completeQuiz = async (req, res) => {
    try{
        const { userid } = req.params
        const { score } = req.body

        const student = await Student.findByPk(userid);
        const teacher = await Teacher.findByPk(userid);

        const foundUser = student ? student : teacher;

        if (!foundUser) {
            return res.status(404).json({ message: 'User not found' });
        }

        foundUser.hascompletedquiz = true;
        foundUser.xp = (Number(foundUser.xp) || 0) + 10*Number(score);
        await foundUser.save();

        return res.status(200).json({ message: 'Quiz completed' });
    }catch(error){
        /* istanbul ignore next */
        return res.status(500).json({ message: 'Internal server error' });
    }
}

const resetDailyQuiz = async () => {
    try {
        await Student.update({ hascompletedquiz: false }, { where: {} });
        await Teacher.update({ hascompletedquiz: false }, { where: {} });
        console.log("Daily quiz reset completed at 10:10.");
    } catch (error) {
        console.error("Error resetting daily quiz:", error);
    }
};

cron.schedule("0 0 * * *", () => {
    console.log("Executing daily reset at 10:10...");
    resetDailyQuiz();
});

module.exports = {
    completeQuiz
}