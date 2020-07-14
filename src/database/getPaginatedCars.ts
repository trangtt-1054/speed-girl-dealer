import { ParsedUrlQuery } from "querystring";
import { openDB } from "../openDB";
import { CarModel } from "../../api/Car";
import { getAsString } from "../getAsString";

//tách thành mainQuery để dùng chung query đó cho totalRows (all the search results of cars)
const mainQuery = `
    FROM car
    WHERE (@make is NULL OR @make = make)
    AND (@model is NULL OR @model = model)
    AND (@minPrice is NULL OR @minPrice <= price)
    AND (@maxPrice is NULL OR @maxPrice >= price)
`;

export async function getPaginatedCars(query: ParsedUrlQuery) {
  //get the query from Nextjs
  const db = await openDB();

  const currentPage = getValueNumber(query.page) || 1;
  const rowsPerPage = getValueNumber(query.rowsPerPage) || 4; //4 cars per page
  const offset = (currentPage - 1) * rowsPerPage;

  const dbParams = {
    "@make": getValuesString(query.make), //make can be null, undefined, 'all'. if it's 'all' => treat similar to null (not apply the filter)
    "@model": getValuesString(query.model),
    "@minPrice": getValueNumber(query.minPrice),
    "@maxPrice": getValueNumber(query.maxPrice)
  };
  /*khi có 2 query thì dùng Promise.all, có Promise rồi thì bỏ await ok. Original code: 
  const cars = await db.all<CarModel[]>(
    `SELECT * ${mainQuery} LIMIT @rowsPerPage OFFSET 10 @offset`,
    { ...dbParams, "@rowsPerPage": rowsPerPage, "@offset": offset }
  );

  const totalRows = await db.get<{ count: number }>(
    `SELECT COUNT(*) as count ${mainQuery}`,
    dbParams
  ); */

  const carsPromise = db.all<CarModel[]>(
    `SELECT * ${mainQuery} LIMIT @rowsPerPage OFFSET @offset`,
    { ...dbParams, "@rowsPerPage": rowsPerPage, "@offset": offset }
  );

  const totalPagesPromise = db.get<{ count: number }>(
    `SELECT COUNT(*) as count ${mainQuery}`,
    dbParams
  );

  const [cars, totalRows] = await Promise.all([carsPromise, totalPagesPromise]);

  return { cars, totalPages: Math.ceil(totalRows.count / rowsPerPage) };
}
/*
WHERE (@make is NULL): if make is not defined, do not apply that filter
LIMIT 5 OFFSET 10: get row 11, 12, 13, 14, 15 (offset 10 and get 5)
*/

function getValueNumber(value: string | string[]) {
  const str = getValuesString(value);
  const number = parseInt(str); //có thể parse thành number hoặc ko (tức là bị NaN)
  return isNaN(number) ? null : number;
}

function getValuesString(value: string | string[]) {
  const str = getAsString(value);
  return !str || str.toLowerCase() === "all" ? null : str; //nếu bằng all thì coi như null luôn => ko apply filter nữa
}
