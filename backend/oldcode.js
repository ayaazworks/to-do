import e from 'express';
import { collectionName, connection } from './dbconfig.js';
import cors from 'cors'
import { ObjectId } from 'mongodb';
import jwt from 'jsonwebtoken';
import cookieParser from 'cookie-parser';

const app = e();
app.use(e.json());
app.use(cors({
    origin: "http://localhost:5173",
    credentials: true
}));
app.use(cookieParser());

app.get("/", (req, res) => {
    res.send({
        message: "Basic API done",
        success: true

    })
})



app.get("/tasks", verifyJWTToken, async (req, res) => {
    const db = await connection();
    const collection = await db.collection(collectionName);
    const result = await collection.find().toArray();
    if (result) {
        res.send({
            message: "Task list fetched",
            success: true,
            result: result
        });

    } else {
        res.send({
            message: "try after sometime",
            success: false
        })
    }
})
app.get("/task/:id",verifyJWTToken, async (req, res) => {
    const db = await connection();
    const collection = await db.collection(collectionName);
    const id = req.params.id;
    const result = await collection.findOne({ _id: new ObjectId(id) });
    if (result) {
        res.send({
            message: "Task fetched",
            success: true,
            result: result
        });

    } else {
        res.send({
            message: "try after sometime",
            success: false
        })
    }
})
app.delete("/delete/:id",verifyJWTToken, async (req, res) => {
    const db = await connection();
    const collection = await db.collection(collectionName);
    const id = req.params.id;
    const result = await collection.deleteOne({ _id: new ObjectId(id) })
    if (result) {
        res.send({
            message: "Task deleted",
            success: true,
            result: result
        });

    } else {
        res.send({
            message: "try after sometime",
            success: false
        })
    }
})
app.delete("/delete-multiple",verifyJWTToken, async (req, res) => {
    const db = await connection();
    const ids = req.body;
    const deleteTaskIds = ids.map((item) => new ObjectId(item))

    const collection = await db.collection(collectionName);
    const result = await collection.deleteMany({ _id: { $in: deleteTaskIds } })
    if (result) {
        res.send({
            message: "Task deleted",
            success: result,
        });

    } else {
        res.send({
            message: "try after sometime",
            success: false
        })
    }
})
app.post("/add-task",verifyJWTToken, async (req, res) => {
    const db = await connection();
    const collection = await db.collection(collectionName);
    const result = await collection.insertOne(req.body);
    if (result) {
        res.send({
            message: "Task added successfully",
            success: true,
            result: result
        });

    } else {
        res.send({
            message: "task not added",
            success: false
        })
    }
})
app.put("/update-task",verifyJWTToken, async (req, res) => {
    const db = await connection();
    const collection = await db.collection(collectionName);
    const { _id, ...fields } = req.body;
    const filter = { _id: new ObjectId(_id) };
    const updateDoc = { $set: fields };

    const result = await collection.updateOne(filter, updateDoc);

    if (result) {
        res.send(
            {
                message: "task data updated",
                success: true,
                result: result
            }
        )
    } else {
        res.send({
            message: 'error occured try after sometime',
            success: false
        })
    }
})

app.post('/signup', async (req, res) => {
    const userData = req.body;
    if (userData.email && userData.password) {
        const db = await connection();
        const collection = await db.collection('users');
        const result = await collection.insertOne(userData);
        if (result) {
            jwt.sign(userData, "Google", { expiresIn: '5d' }, (error, token) => {
                res.send({
                    success: true,
                    message: "signup done",
                    token
                })
            })
        }


    } else {
        res.send({
            success: false,
            message: 'signup failed, Enter Both Details Right',

        })
    }
})

app.post('/login', async (req, res) => {
    const userData = req.body;
    if (userData.email && userData.password) {
        const db = await connection();
        const collection = await db.collection('users');
        const result = await collection.findOne({ email: userData.email, password: userData.password });
        if (result) {
            jwt.sign(userData, "Google", { expiresIn: '5d' }, (error, token) => {
                res.send({
                    success: true,
                    message: "Login done",
                    token
                })
            })
        } else {
            res.send({
                success: false,
                message: 'User Not found or Password Incorrect',

            })
        }


    } else {
        res.send({
            succes: false,
            message: 'signup failed, Enter Both Details Right',

        })
    }
})

function verifyJWTToken(req, res, next) {
    // console.log("verify token", req.cookies["token"]);
    const token = req.cookies['token'];
    jwt.verify(token, "Google", (error, decoded) => {
        if (error) {
            return res.send({
                message: "Invalid Token login again",
                success: false
            })
        }
        console.log(decoded)
        next()
    })
    
}

app.listen(3300)