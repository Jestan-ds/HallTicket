import express from "express"

import { createUserDetails,getAllUsersDetails,getUserDetailsById,updateUserDetails,deleteUserDetails } from "../controllers/userDetails"

const userDetailsRouter = express.Router();

userDetailsRouter.get("/", getAllUsersDetails);

userDetailsRouter.get("/:id", async (req, res) => {
    getUserDetailsById(req, res)
});

userDetailsRouter.post("/create", async (req, res) => {
    createUserDetails(req, res)
});

userDetailsRouter.put("/update/:id", async (req, res) => {
    updateUserDetails(req, res)
});

userDetailsRouter.delete("/delete/:id", async (req, res) => {
    deleteUserDetails(req, res)
}
);

export default userDetailsRouter;