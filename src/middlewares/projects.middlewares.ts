import { NextFunction, Request, Response } from "express";
import { QueryConfig, QueryResult } from "pg";
import format from "pg-format";
import { client } from "../database";

export const projectId = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<Response | void> => {
  const { id } = req.params;

  const queryString: string = `
      SELECT
          *
      FROM
          projects
      WHERE 
          id = $1;
      `;

  const queryConfig: QueryConfig = {
    text: queryString,
    values: [id],
  };

  const queryResult: QueryResult = await client.query(queryConfig);

  if (!queryResult.rowCount) {
    return res.status(404).json({ message: "Project not found." });
  }

  return next();
};

export const projectDev = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<Response | void> => {
  const data = req.body;

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

  return next();
};
