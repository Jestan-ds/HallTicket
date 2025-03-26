import expres from "express"
import { examRegistration } from "../controllers/examRegistrationController"

const examRegistrationRouter = expres.Router()

examRegistrationRouter.post("/register", (req, res) => {
    examRegistration(req, res)
})

export default examRegistrationRouter