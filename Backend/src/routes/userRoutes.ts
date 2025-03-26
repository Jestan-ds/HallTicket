import express from "express"
import { registerUser,loginUser, getUser } from "../controllers/userController"

const userRouter = express.Router()

userRouter.post("/register", async (req, res) => {
    await registerUser(req, res)
})

userRouter.post("/login", async (req, res) => {
    await loginUser(req, res)
})

userRouter.get("/user", async (req, res) => {
    await getUser(req, res)
})


export default userRouter
