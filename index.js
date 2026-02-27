import express from 'express';
import cors from 'cors';
import { router as todoRouter } from "./routes/todo.route.js";
import { sequelize } from "./services/todo.services.js";

const app = express();
const PORT = process.env.PORT || 3005;

app.use(cors());
app.use(express.json());
app.use('/todos', todoRouter);

sequelize.sync().then(() => {
    console.log("✅ Database connected and synced");
    app.listen(PORT, () => {
        console.log(`🚀 Server is running on port ${PORT}`);
    });
}).catch(err => {
    console.error("❌ Database connection error:", err);
});