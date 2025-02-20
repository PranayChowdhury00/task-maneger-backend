const { MongoClient, ServerApiVersion } = require('mongodb');
const express = require('express');
const cors = require('cors');
const jwt = require('jsonwebtoken');
const cookieParser = require('cookie-parser');
require('dotenv').config();
const { ObjectId } = require('mongodb'); 
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
        app.post('/user', async (req, res) => {
            const { name, email, uid } = req.body;
            const data = { uid, name, email }; // Save user details without password
            const result = await usersCollection.insertOne(data);
            
            // Generate JWT
            const token = jwt.sign({ uid, email }, process.env.JWT_SECRET, { expiresIn: '1h' }); // Set expiration as needed
            res.status(201).json({ result, token }); // Return the created user and token
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
        app.patch('/tasks/:taskId', async (req, res) => {
            const { taskId } = req.params;
           
            const updateData = { $set: req.body }; // Update body as per request
           console.log(updateData)
            try {
                const result = await tasksCollection.updateOne({ _id: new ObjectId(taskId) }, updateData);
                console.log("Update Result:", result)
                if (result.modifiedCount > 0) {
                    res.json({ modifiedCount: result.modifiedCount });
                } else {
                    res.status(404).json({ message: "Task not found or no changes made." });
                }
            } catch (error) {
                res.status(500).json({ message: "Error updating task." });
            }
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
