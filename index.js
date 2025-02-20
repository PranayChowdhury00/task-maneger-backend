const { MongoClient, ServerApiVersion } = require('mongodb');
const express = require('express');
const cors = require('cors');
const jwt = require('jsonwebtoken');
const cookieParser = require('cookie-parser');
require('dotenv').config();

const app = express();

const port = process.env.PORT || 5000;

// Middleware
app.use(express.json());
app.use(cors({
    origin: ['http://localhost:5173'], // Replace with client address
    credentials: true,
}));

// Cookie parser middleware
app.use(cookieParser());

// MongoDB connection setup
const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.50gak.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0`;

// Create a MongoClient with a MongoClientOptions object to set the Stable API version
const client = new MongoClient(uri, {
    serverApi: {
        version: ServerApiVersion.v1,
        strict: true,
        deprecationErrors: true,
    }
});

async function run() {
    try {
        const db = client.db("TaskManager");
        const usersCollection = db.collection("users");
        const tasksCollection = db.collection("tasks"); // Collection for tasks

        // 🔹 Save User to DB and generate JWT
        // After importing necessary modules
const jwt = require('jsonwebtoken');
require('dotenv').config();

// 🔹 Save User to DB and Generate JWT
app.post('/user', async (req, res) => {
    const { name, email, uid } = req.body;
    const data = { uid, name, email };

    try {
        const result = await usersCollection.insertOne(data);

        // Generate a JWT token
        const token = jwt.sign({ uid, email }, process.env.JWT_SECRET, { expiresIn: '1h' });

        res.cookie('token', token, { httpOnly: true }); // Optional: set token as a cookie
        res.status(201).json({ success: true, token }); // Send token back to the client
    } catch (error) {
        res.status(500).json({ success: false, message: 'User registration failed', error });
    }
});


        // 🔹 Add a Task (if needed)
        app.post('/tasks', async (req, res) => {
            const task = req.body;
            task.createdAt = new Date(); // Timestamp
            const result = await tasksCollection.insertOne(task);
            res.status(201).json(result); // Return the created task with a status code
        });

        // 🔹 Get Tasks for a Specific User
        app.get('/tasks/:userId', async (req, res) => {
            const { userId } = req.params;
            const tasks = await tasksCollection.find({ userId }).toArray();
            res.json(tasks); // Return tasks found for the user
        });

        // 🔹 Update Task
        app.put('/tasks/:taskId', async (req, res) => {
            const { taskId } = req.params;
            const updateData = { $set: req.body };
            const result = await tasksCollection.updateOne({ _id: new ObjectId(taskId) }, updateData);
            res.json(result); // Return the updated task
        });

        // 🔹 Delete Task
        app.delete('/tasks/:taskId', async (req, res) => {
            const { taskId } = req.params;
            const result = await tasksCollection.deleteOne({ _id: new ObjectId(taskId) });
            res.json(result); // Return the deleted task result
        });

        // Confirm MongoDB connection
        await client.db("admin").command({ ping: 1 });
        console.log("✅ Successfully connected to MongoDB");
    } catch (error) {
        console.error("❌ Error connecting to MongoDB:", error);
    }
}
run().catch(console.dir);

// MongoDB end

app.get('/', (req, res) => {
    res.send('Hello from my server');
});

app.listen(port, () => {
    console.log('My simple server is running at', port);
});
