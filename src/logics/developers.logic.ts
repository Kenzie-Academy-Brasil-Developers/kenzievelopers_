import { Request, Response } from "express";

import format from "pg-format";
import { QueryConfig, QueryResult } from "pg";
import { client } from "../database";
import {
  IDevelopers,
  IDevelopersRes,
  IDevInfo,
  IDevInfoRes,
} from "../interfaces/developers.interfaces";

export const createDev = async (
  req: Request,
  res: Response
): Promise<Response> => {
  const devData: IDevelopers = req.body;

  const queryString: string = format(
    `
        INSERT INTO
          developers(%I)
        VALUES
          (%L)
        RETURNING *;
      `,
    Object.keys(devData),
    Object.values(devData)
  );

  const queryResult: QueryResult<IDevelopersRes> = await client.query(
    queryString
  );
  return res.status(201).json(queryResult.rows[0]);
};

export const listDev = async (
  req: Request,
  res: Response
): Promise<Response> => {
  const { id } = req.params;

  const queryString: string = `
  SELECT
    dev."id" "developerId",
    dev."name" "developerName",
    dev."email" "developerEmail",
    devin."developerSince" "developerInfoDeveloperSince",
    devin."preferredOS" "developerInfoPreferredOS"
  FROM 
    developers dev
  LEFT JOIN
    developer_infos devin ON dev."id" = devin."developerId"
  WHERE    
    dev.id = $1;
  `;

  const queryConfig: QueryConfig = {
    text: queryString,
    values: [id],
  };

  const queryResult: QueryResult<IDevelopers> = await client.query(queryConfig);

  return res.json(queryResult.rows[0]);
};

export const updateDev = async (
  req: Request,
  res: Response
): Promise<Response> => {
  const { id } = req.params;
  const updateDev = req.body;

  if (updateDev.id || updateDev.developersince || updateDev.preferredOS) {
    delete updateDev.id;
    delete updateDev.developersince;
    delete updateDev.preferredOS;
  }

  const queryString: string = format(
    `
      UPDATE 
          developers 
          SET(%I) = ROW(%L)
      WHERE 
          id = $1
      RETURNING *;
      `,
    Object.keys(updateDev),
    Object.values(updateDev)
  );

  const queryConfig: QueryConfig = {
    text: queryString,
    values: [id],
  };

  const queryResult: QueryResult<IDevelopersRes> = await client.query(
    queryConfig
  );

  return res.json(queryResult.rows[0]);
};

export const deleteDev = async (
  req: Request,
  res: Response
): Promise<Response> => {
  const { id } = req.params;

  const queryString: string = `
      DELETE FROM 
          developers
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

export const createDevInfo = async (
  req: Request,
  res: Response
): Promise<Response> => {
  const infoData: IDevInfo = req.body;
  const { id: developerId } = req.params;

  const data = {
    ...infoData,
    developerId,
  };

  const queryStringId: string = `
      SELECT
          *
      FROM
          developer_infos
      WHERE
      "developerId" = $1;
  `;

  const queryConfigID: QueryConfig = {
    text: queryStringId,
    values: [developerId],
  };

  const queryResultID: QueryResult = await client.query(queryConfigID);

  if (queryResultID.rowCount > 0) {
    return res.status(409).json({
      message: "Developer infos already exists.",
    });
  }

  const dataOS = ["Windows", "Linux", "MacOS"];

  if (!dataOS.includes(infoData.preferredOS)) {
    return res.status(400).json({
      message: "Invalid OS option.",
      options: ["Windows", "Linux", "MacOS"],
    });
  }

  const queryStringInsert: string = format(
    `
          INSERT INTO
              developer_infos (%I)
          VALUES
              (%L)
          RETURNING *;
      `,
    Object.keys(data),
    Object.values(data)
  );

  const queryResultInsert: QueryResult<IDevInfoRes> = await client.query(
    queryStringInsert
  );

  return res.status(201).json(queryResultInsert.rows[0]);
};
