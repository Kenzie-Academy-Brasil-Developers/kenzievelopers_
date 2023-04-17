import express, { Application } from "express";
import "dotenv/config";
import {
  createDev,
  createDevInfo,
  deleteDev,
  listDev,
  updateDev,
} from "./logics/developers.logic";
import { devEmail, devId } from "./middlewares/developers.middlewares";
import {
  createProject,
  createTec,
  deleteProjects,
  deleteTec,
  listProjects,
  updateProjects,
} from "./logics/projects.logic";
import { projectDev, projectId } from "./middlewares/projects.middlewares";

const app: Application = express();
app.use(express.json());

app.post("/developers", devEmail, createDev);
app.get("/developers/:id", devId, listDev);
app.patch("/developers/:id", devId, devEmail, updateDev);
app.delete("/developers/:id", devId, deleteDev);
app.post("/developers/:id/infos", devId, createDevInfo);

app.post("/projects", projectDev, createProject);
app.get("/projects/:id", projectId, listProjects);
app.patch("/projects/:id", projectId, projectDev, updateProjects);
app.delete("/projects/:id", projectId, deleteProjects);
app.post("/projects/:id/technologies", projectId, createTec);
app.delete("/projects/:id/technologies/:name", deleteTec);

export default app;
