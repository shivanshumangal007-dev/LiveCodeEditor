import express from "express";
import http from "http";
import { YSocketIO } from "y-socket.io/dist/server";
import { Server } from "socket.io";

const app = express();
const server = http.createServer(app);

app.use(express.static("public"));
const io = new Server(server, {
    cors: {
        origin: "*",
        methods: ["GET", "POST"],
    },
});

const ySocketIO = new YSocketIO(io);
ySocketIO.initialize();


app.get("/health" , (req, res) => {
    res.status(200).json({message: "Server is healthy"});
})

server.listen(3000, () => {
	console.log("Server is running on port 3000");
});
