import { Grid } from "@material-ui/core";
import Search from ".";
import { GetServerSideProps } from "next";
import { getMakes, Make } from "../database/getMakes";
import { getModels, Model } from "../database/getModel";
import { getAsString } from "../getAsString";
import { CarModel } from "../../api/Car";
import { getPaginatedCars } from "../database/getPaginatedCars";
import Pagination from "@material-ui/lab/Pagination";
import PaginationItem from "@material-ui/lab/PaginationItem";
import { PaginationRenderItemParams } from "@material-ui/lab";
import { useRouter } from "next/router";
import Link from "next/link";
import { ParsedUrlQuery } from "querystring";
import { forwardRef } from "react";

export interface CarListProps {
  makes: Make[];
  models: Model[];
  cars: CarModel[];
  totalPages: number;
}

export default function CarsList({
  makes,
  models,
  cars,
  totalPages
}: CarListProps) {
  const { query } = useRouter();
  return (
    <Grid container spacing={3}>
      <Grid item xs={12} sm={5} md={3} lg={2}>
        <Search singleColumn makes={makes} models={models} />
      </Grid>
      <Grid item xs={12} sm={7} md={9} lg={10}>
        <pre style={{ fontSize: "2.5rem" }}>
          <Pagination
            page={parseInt(getAsString(query.page) || "1")}
            count={totalPages}
            renderItem={item => (
              <PaginationItem
                //component={Link} //Link from Nextjs doesn't work here so we will create our own component
                component={MULink}
                query={query} //props tự pass thêm vào
                item={item} //item={item}
                {...item}
              />
            )}
          />
          {JSON.stringify({ totalPages, cars }, null, 4)}
        </pre>
      </Grid>
    </Grid>
  );
}

export interface MULinkProps {
  item: PaginationRenderItemParams;
  query: ParsedUrlQuery;
}

const MULink = forwardRef<HTMLAnchorElement, MULinkProps>(
  ({ item, query, ...props }, ref) => (
    <Link
      href={{ pathname: "/cars", query: { ...query, page: item.page } }}
      shallow
    >
      <a ref={ref} {...props}></a>
    </Link>
  )
);

export const getServerSideProps: GetServerSideProps = async ctx => {
  const make = getAsString(ctx.query.make);
  //dùng Promise thay vì get từng cái khi muốn get 2 cái cùng lúc chứ ko phải chờ cái nọ xong mới get cái kia
  const [makes, models, pagination] = await Promise.all([
    getMakes(),
    getModels(make),
    getPaginatedCars(ctx.query)
  ]);

  //const makes = await getMakes();
  //const models = await getModels(make); //get all the models when page first load
  return {
    props: {
      makes,
      models,
      cars: pagination.cars,
      totalPages: pagination.totalPages
    }
  };
};
