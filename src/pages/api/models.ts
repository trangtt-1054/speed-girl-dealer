import { NextApiRequest, NextApiResponse } from "next";
import { getAsString } from "../../getAsString";
import { getModels } from "../../database/getModel";

//create api route for 'model' because at run time, we want when we choose a brand, it will call an api of models available in those brands for us.

export default async function models(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const make = getAsString(req.query.make); //routing from Next will always be string or array of string => create a helper call getAsString to grab only the first one in that params array if it is an array.
  const models = getModels(make);
  res.json(models);
}
