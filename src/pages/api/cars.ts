//api để get cars khi shallow navigate, vì shallow navigate ko chạy getServerSideProps nữa
import { NextApiRequest, NextApiResponse } from "next";
import { getPaginatedCars } from "../../database/getPaginatedCars";

export default async function cars(req: NextApiRequest, res: NextApiResponse) {
  const cars = await getPaginatedCars(req.query);
  res.json(cars);
  //api done, pass page vào url, pagination vẫn chạy ok
}
