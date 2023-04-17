import { Request, Response } from "express";
import { QueryConfig, QueryResult } from "pg";
import format from "pg-format";
import { client } from "../database";
import {
  IProject,
  IProjectList,
  IProjectUp,
  ITec,
} from "../interfaces/projects.interfaces";

export const createProject = async (
  req: Request,
  res: Response
): Promise<Response> => {
  const projctData: IProject = req.body;

  const queryStringId: string = format(
    `
    SELECT 
      *
    FROM 
      developers
    WHERE
      id = $1    
    `
  );

  const queryConfigId: QueryConfig = {
    text: queryStringId,
    values: [projctData.developerId],
  };

  const queryResultId: QueryResult = await client.query(queryConfigId);

  if (!queryResultId.rowCount) {
    return res.status(404).json({
      message: "Developer not found.",
    });
  }

  const queryString: string = format(
    `
      INSERT INTO
          projects(%I)
      VALUES
          (%L)
      RETURNING *;
    `,
    Object.keys(projctData),
    Object.values(projctData)
  );

  const queryResult: QueryResult<IProject> = await client.query(queryString);

  return res.status(201).json(queryResult.rows[0]);
};

export const listProjects = async (
  req: Request,
  res: Response
): Promise<Response> => {
  const { id } = req.params;

  const queryString: string = `
  SELECT 
    p.id AS "projectId",
    p.name AS "projectName",
    p.description AS "projectDescription",
    p."estimatedTime" AS "projectEstimatedTime",
    p.repository AS "projectRepository",
    p."startDate" AS "projectStartDate",
    p."endDate" AS "projectEndDate",
    p."developerId" AS "projectDeveloperId",
    pt."technologyId",
    t.name AS "technologyName"
  FROM 
    projects p
    LEFT JOIN projects_technologies pt ON p.id = pt."projectId"
    LEFT JOIN technologies t ON pt."technologyId" = t.id
  WHERE 
    p.id = $1;
  `;

  const queryConfig: QueryConfig = {
    text: queryString,
    values: [id],
  };

  const queryResult: QueryResult<IProjectList> = await client.query(
    queryConfig
  );

  return res.status(200).json(queryResult.rows);
};

export const updateProjects = async (
  req: Request,
  res: Response
): Promise<Response> => {
  const { id } = req.params;
  const data: IProjectUp = req.body;

  const queryStringId: string = format(
    `
    SELECT 
      *
    FROM 
      developers
    WHERE
      id = $1    
    `
  );

  const queryConfigId: QueryConfig = {
    text: queryStringId,
    values: [data.developerId],
  };

  const queryResultId: QueryResult = await client.query(queryConfigId);

  if (!queryResultId.rowCount) {
    return res.status(404).json({
      message: "Developer not found.",
    });
  }

  const queryString: string = format(
    `
      UPDATE 
          projects 
          SET(%I) = ROW(%L)
      WHERE 
          id = $1
      RETURNING *;
      `,
    Object.keys(data),
    Object.values(data)
  );

  const queryConfig: QueryConfig = {
    text: queryString,
    values: [id],
  };

  const queryResult: QueryResult<IProjectUp> = await client.query(queryConfig);

  return res.status(200).json(queryResult.rows[0]);
};

export const deleteProjects = async (
  req: Request,
  res: Response
): Promise<Response> => {
  const { id } = req.params;

  const queryString: string = `
        DELETE FROM 
            projects
        WHERE 
            id = $1 ;
    `;

  const queryConfig: QueryConfig = {
    text: queryString,
    values: [id],
  };

  await client.query(queryConfig);

  return res.status(204).send();
};

export const createTec = async (
  req: Request,
  res: Response
): Promise<Response> => {
  const { id } = req.params;
  const data: ITec = req.body;

  const dataTec = [
    "JavaScript",
    "Python",
    "React",
    "Express.js",
    "HTML",
    "CSS",
    "Django",
    "PostgreSQL",
    "MongoDB",
  ];

  if (!dataTec.includes(data.name)) {
    return res.status(400).json({
      message: "Technology not supported.",
      options: [
        "JavaScript",
        "Python",
        "React",
        "Express.js",
        "HTML",
        "CSS",
        "Django",
        "PostgreSQL",
        "MongoDB",
      ],
    });
  }

  const queryStringTec: string = `
    SELECT
      *
    FROM
      technologies
    WHERE
      name = $1;
  `;

  const queryConfigTec: QueryConfig = {
    text: queryStringTec,
    values: [data.name],
  };

  const queryResultTec: QueryResult = await client.query(queryConfigTec);

  const tecId = queryResultTec.rows[0].id;

  const date = new Date();

  const queryStringName: string = `
  SELECT
    *
  FROM
    projects_technologies
  WHERE
    "technologyId" = $1 AND "projectId" = $2;
`;

  const queryConfigName: QueryConfig = {
    text: queryStringName,
    values: [tecId, id],
  };

  const queryResultName: QueryResult = await client.query(queryConfigName);

  if (queryResultName.rowCount > 0) {
    return res.status(409).json({
      message: "This technology is already associated with the project",
    });
  }

  const queryStringInsert: string = `
    INSERT INTO
        projects_technologies ("addedIn", "technologyId", "projectId")
    VALUES
        ($1, $2, $3)
    RETURNING *;
  `;

  const queryConfigInsert: QueryConfig = {
    text: queryStringInsert,
    values: [date, tecId, id],
  };

  await client.query(queryConfigInsert);

  const queryString: string = `
  SELECT
    tec."id" AS "technologyId",
    tec."name" AS "technologyName",
    proj."id" AS "projectId",
    proj."name" AS "projectName",
    proj."description" AS "projectDescription",
    proj."estimatedTime" AS "projectEstimatedTime",
    proj."repository" AS "projectRepository",
    proj."startDate" AS "projectStartDate",
    proj."endDate" AS "projectEndDate"
  FROM 
    technologies AS tec
    JOIN projects_technologies AS projTec ON tec."id" = projTec."technologyId"
    JOIN projects AS proj ON proj."id" = projTec."projectId"
  WHERE    
    tec.name = $1; 
`;

  const queryConfig: QueryConfig = {
    text: queryString,
    values: [data.name],
  };

  const queryResult: QueryResult<IProjectList> = await client.query(
    queryConfig
  );

  return res.status(201).json(queryResult.rows[0]);
};

export const deleteTec = async (
  req: Request,
  res: Response
): Promise<Response> => {
  const { id, name } = req.params;

  const queryStringID: string = `
  SELECT
      *
  FROM
      developers
  WHERE
      id = $1;
  `;

  const queryConfigID: QueryConfig = {
    text: queryStringID,
    values: [id],
  };

  const queryResultId: QueryResult = await client.query(queryConfigID);

  if (!queryResultId.rowCount) {
    return res.status(404).json({ message: "Project not found." });
  }

  const dataTec = [
    "JavaScript",
    "Python",
    "React",
    "Express.js",
    "HTML",
    "CSS",
    "Django",
    "PostgreSQL",
    "MongoDB",
  ];

  if (!dataTec.includes(name)) {
    return res.status(400).json({
      message: "Technology not supported.",
      options: [
        "JavaScript",
        "Python",
        "React",
        "Express.js",
        "HTML",
        "CSS",
        "Django",
        "PostgreSQL",
        "MongoDB",
      ],
    });
  }

  const queryStringName: string = `
  SELECT
    tec."name" AS "technologyName"
  FROM 
    technologies AS tec
    JOIN projects_technologies AS projTec ON tec."id" = projTec."technologyId"
    JOIN projects AS proj ON proj."id" = projTec."projectId"
  WHERE    
      tec.name = $1;
  `;

  const queryConfigName: QueryConfig = {
    text: queryStringName,
    values: [name],
  };

  const queryResultName: QueryResult = await client.query(queryConfigName);

  if (!queryResultName.rowCount) {
    return res
      .status(400)
      .json({ message: "Technology not related to the project." });
  }

  const queryString: string = `
        DELETE FROM 
          projects_technologies
        WHERE 
            "projectId" = $1;
    `;

  const queryConfig: QueryConfig = {
    text: queryString,
    values: [id],
  };

  await client.query(queryConfig);

  return res.status(204).send();
};
