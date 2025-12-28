import e from 'express';
import 'dotenv/config';
import { collectionName, connection } from './dbconfig.js'; 
import cors from 'cors';
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

// --- MIDDLEWARE ---
function verifyJWTToken(req, res, next) {
    const token = req.cookies['token'];
    
    if (!token) {
        return res.send({
            message: "No token provided, please login",
            success: false
        });
    }

    jwt.verify(token, process.env.JWT_SECRET, (error, decoded) => {
        if (error) {
            return res.send({
                message: "Invalid Token, please login again",
                success: false
            });
        }
        
        req.user = decoded; 
        next();
    });
}

app.get("/", (req, res) => {
    res.send({
        message: "Basic API done",
        success: true
    });
});


// 1. Get Tasks (Only for the logged-in user)
app.get("/tasks", verifyJWTToken, async (req, res) => {
    const db = await connection();
    const collection = await db.collection(collectionName);
    
    const result = await collection.find({ userEmail: req.user.email }).toArray();
    
    if (result) {
        res.send({
            message: "Task list fetched",
            success: true,
            result: result
        });
    } else {
        res.send({
            message: "Try after sometime",
            success: false
        });
    }
});

// 2. Get Single Task (Only if it belongs to user)
app.get("/task/:id", verifyJWTToken, async (req, res) => {
    const db = await connection();
    const collection = await db.collection(collectionName);
    const id = req.params.id;
    
    // FILTER: Check ID AND User Email
    const result = await collection.findOne({ 
        _id: new ObjectId(id),
        userEmail: req.user.email 
    });

    if (result) {
        res.send({
            message: "Task fetched",
            success: true,
            result: result
        });
    } else {
        res.send({
            message: "Task not found or access denied",
            success: false
        });
    }
});

// 3. Delete Single Task (Only for Owner of that Task)
app.delete("/delete/:id", verifyJWTToken, async (req, res) => {
    const db = await connection();
    const collection = await db.collection(collectionName);
    const id = req.params.id;
    
    // FILTER: Ensure user can only delete their own task
    const result = await collection.deleteOne({ 
        _id: new ObjectId(id),
        userEmail: req.user.email 
    });

    if (result.deletedCount > 0) {
        res.send({
            message: "Task deleted",
            success: true,
            result: result
        });
    } else {
        res.send({
            message: "Task not found or unauthorized",
            success: false
        });
    }
});

// 4. Delete Multiple (Only if they belong to user)
app.delete("/delete-multiple", verifyJWTToken, async (req, res) => {
    const db = await connection();
    const ids = req.body; // Expecting array of ID strings
    const deleteTaskIds = ids.map((item) => new ObjectId(item));

    const collection = await db.collection(collectionName);
    
    // FILTER: Delete where ID is in list AND userEmail is match
    const result = await collection.deleteMany({ 
        _id: { $in: deleteTaskIds },
        userEmail: req.user.email
    });

    if (result) {
        res.send({
            message: "Tasks deleted",
            success: true,
            result: result
        });
    } else {
        res.send({
            message: "Try after sometime",
            success: false
        });
    }
});

// 5. Add Task (Tags the task with the user's email)
app.post("/add-task", verifyJWTToken, async (req, res) => {
    const db = await connection();
    const collection = await db.collection(collectionName);
    
    // ACTION: Add the userEmail field to the new task object
    const newTask = {
        ...req.body,
        userEmail: req.user.email
    };

    const result = await collection.insertOne(newTask);
    
    if (result) {
        res.send({
            message: "Task added successfully",
            success: true,
            result: result
        });
    } else {
        res.send({
            message: "Task not added",
            success: false
        });
    }
});

// 6. Update Task (Only if it belongs to user)
app.put("/update-task", verifyJWTToken, async (req, res) => {
    const db = await connection();
    const collection = await db.collection(collectionName);
    const { _id, ...fields } = req.body;
    
    // FILTER: Find by ID AND User Email
    const filter = { 
        _id: new ObjectId(_id),
        userEmail: req.user.email 
    };
    const updateDoc = { $set: fields };

    const result = await collection.updateOne(filter, updateDoc);

    if (result.matchedCount > 0) {
        res.send({
            message: "Task updated",
            success: true,
            result: result
        });
    } else {
        res.send({
            message: "Update failed or unauthorized",
            success: false
        });
    }
});

// --- AUTH ROUTES ---

app.post('/signup', async (req, res) => {
    const userData = req.body;
    if (userData.email && userData.password) {
        const db = await connection();
        const collection = await db.collection('users');
        
        // Optional: Check if user already exists
        const existingUser = await collection.findOne({ email: userData.email });
        if(existingUser){
            return res.send({ success: false, message: "User already exists" });
        }

        const result = await collection.insertOne(userData);
        if (result) {
            // Sign the token with the user data so we can use req.user.email later
            jwt.sign(userData, process.env.JWT_SECRET, { expiresIn: '5d' }, (error, token) => {
                // Set cookie immediately upon signup
                res.cookie('token', token, {
                    httpOnly: true, // Good for security
                    secure: false, // Set to true if using HTTPS
                    sameSite: 'lax'
                }).send({
                    success: true,
                    message: "Signup done",
                    token
                });
            });
        }
    } else {
        res.send({
            success: false,
            message: 'Signup failed, enter valid details'
        });
    }
});

app.post('/login', async (req, res) => {
    const userData = req.body;
    if (userData.email && userData.password) {
        const db = await connection();
        const collection = await db.collection('users');
        const result = await collection.findOne({ email: userData.email, password: userData.password });
        
        if (result) {
            // Remove password before signing if you want to be extra secure, but for now:
            const payload = { email: result.email, _id: result._id };

            jwt.sign(payload,process.env.JWT_SECRET, { expiresIn: '5d' }, (error, token) => {
                res.cookie('token', token, {
                    httpOnly: true,
                    secure: false, // Set to true if using HTTPS
                    sameSite: 'lax'
                }).send({
                    success: true,
                    message: "Login done",
                    token
                });
            });
        } else {
            res.send({
                success: false,
                message: 'User not found or Password Incorrect'
            });
        }
    } else {
        res.send({
            success: false,
            message: 'Login failed, check details'
        });
    }
});

app.listen(3300, () => {
    console.log("Server running on port 3300");
});