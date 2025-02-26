require("dotenv").config();
const express = require("express");
const cors = require("cors");
const { MongoClient, ServerApiVersion, ObjectId } = require("mongodb");
const { Server } = require("socket.io");
const http = require("http");

const port = process.env.PORT || 5000;
const app = express();
const server = http.createServer(app);

app.use(cors());
app.use(express.json());

// const uri = `mongodb+srv://${process.env.USER_NAME}:${process.env.USER_PASS}@cluster0.tui29.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0`;
const uri = process.env.MONGO_URL;

const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  },
});

async function run() {
  try {
    await client.connect();
    console.log("Connected to MongoDB");

    const db = client.db("task-management");
    const usersCollection = db.collection("users");
    const tasksCollection = db.collection("tasks");

    // WebSocket Server
    const io = new Server(server, {
      cors: {
        origin: "*",
        origin: "http://localhost:5173",
        methods: ["GET", "POST"],
      },
    });

    io.on("connection", (socket) => {
      console.log("User connected:", socket.id);

      socket.on("getTasks", async () => {
        const tasks = await tasksCollection.find().toArray();
        const categorizedTasks = { todo: [], inProgress: [], done: [] };
        tasks.forEach((task) => categorizedTasks[task.category].push(task));
        socket.emit("loadTasks", categorizedTasks);
      });

      socket.on("addTask", async ({ category, task }) => {
        await tasksCollection.insertOne({ ...task, category });
        io.emit("getTasks");
      });

      socket.on("updateTask", async ({ taskId, newTitle }) => {
        await tasksCollection.updateOne(
          { _id: new ObjectId(taskId) },
          { $set: { title: newTitle } }
        );
        io.emit("getTasks");
      });

      socket.on("deleteTask", async ({ taskId }) => {
        await tasksCollection.deleteOne({ _id: new ObjectId(taskId) });
        io.emit("getTasks");
      });

      socket.on("moveTask", async ({ taskId, destinationCategory }) => {
        await tasksCollection.updateOne(
          { _id: new ObjectId(taskId) },
          { $set: { category: destinationCategory } }
        );
        io.emit("getTasks");
      });

      socket.on("disconnect", () => {
        console.log("User disconnected:", socket.id);
      });
    });

    // REST API Endpoints
    app.post("/users", async (req, res) => {
      const newUser = req.body;
      const result = await usersCollection.insertOne(newUser);
      res.send(result);
    });

    app.get("/users", async (req, res) => {
      const users = await usersCollection.find().toArray();
      res.send(users);
    });

  } catch (error) {
    console.error("Error:", error);
  }
}
run().catch(console.dir);

app.get("/", (req, res) => {
  res.send("Task Management App is running");
});

server.listen(port, () => {
  console.log(`Server running on port: ${port}`);
});