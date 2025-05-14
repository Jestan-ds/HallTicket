import expres from "express"
import { examRegistration, getRegisteredExam,getRegisteredExamDetailsByApplicationId, getRegisteredExams } from "../controllers/examRegistrationController"


const examRegistrationRouter = expres.Router()

examRegistrationRouter.post("/register", (req, res) => {
    examRegistration(req, res)
})
examRegistrationRouter.get("/getUserExamStats/:id", (req, res) => {
    getRegisteredExam(req, res)
}
)
examRegistrationRouter.get('/registered-exams/:applicationId', (req, res) => {
    getRegisteredExamDetailsByApplicationId(req, res)

});

examRegistrationRouter.get('/registrations', (req, res) => {
    getRegisteredExams(req, res)
});

export default examRegistrationRouter