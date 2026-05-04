import express from "express";
import cors from "cors"
import bcrypt from "bcrypt";
import { prisma } from "@repo/db";

const app = express();
const PORT = 8000;

app.use(cors());
app.use(express.json());

app.get("/users", async (_, res) => {
    try {
        const users = await prisma.user.findMany();

        return res.status(200).json(users);
    } catch (error) {
        console.log("Error fetching users", error);
        return res.status(500).json({ message: "Error fetching users" });
    }
})

app.post("/user", async (req, res) => {
    try {
        const { username, email, password } = req.body;

        if(!username || !email || !password) {
            return res.status(400).json({
                message: "Please provide username, email and password",
            })
        }

        const user = await prisma.user.findFirst({
            where: {
                email: email
            }
        })
        
        if (user) 
            return res.status(409).json({
                message: "User already exists",
            })

        const hashedPassword = await bcrypt.hash(password, 10);

        await prisma.user.create({
            data: {
                username,
                email,
                password: hashedPassword,
            }
        })
    } catch (error) {
        res.status(500).json({
            message: "Internal Server Error",
        })
    }
})

app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});