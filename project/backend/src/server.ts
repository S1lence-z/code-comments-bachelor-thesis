import express from "express";

const app = express();

app.get("/", (req: express.Request, res: express.Response) => {
	console.log(req.method, req.url);
	res.send("Welcome to the Dinosaur API!");
});

app.listen(8000);
console.log(`Server is running on http://localhost:8000`);
