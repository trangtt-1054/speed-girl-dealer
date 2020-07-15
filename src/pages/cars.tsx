import { Grid } from '@material-ui/core';
import Search from '.';
import { GetServerSideProps } from 'next';
import { getMakes, Make } from '../database/getMakes';
import { getModels, Model } from '../database/getModel';
import { getAsString } from '../getAsString';
import { CarModel } from '../../api/Car';
import { getPaginatedCars } from '../database/getPaginatedCars';
import Pagination from '@material-ui/lab/Pagination';
import PaginationItem from '@material-ui/lab/PaginationItem';
import { PaginationRenderItemParams } from '@material-ui/lab';
import { useRouter } from 'next/router';
import Link from 'next/link';
import { ParsedUrlQuery, stringify } from 'querystring';
import { useState } from 'react';
import { forwardRef } from 'react';
import useSWR from 'swr';
import deepEqual from 'fast-deep-equal';
import { CarPagination } from '../components/CarPagination';
import CarCard from '../components/CarCard';

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
  totalPages,
}: CarListProps) {
  const { query } = useRouter();
  const [serverQuery] = useState(query);

  const { data } = useSWR('/api/cars?' + stringify(query), {
    dedupingInterval: 15000,
    initialData: deepEqual(query, serverQuery)
      ? { cars, totalPages }
      : undefined,
    /* if query and serverQuery are the same, pass {cars, totalPages}, if they are different, that means we're alreay on second, third... navigation => ko pass initialData nữa. On first load, current query in browser and query executed in server are the same, but when we go to next page, pass initalData as undefined, so when swr sees no initialData, it will do the call */
  });
  console.log('data', data);
  return (
    <Grid container spacing={3}>
      <Grid item xs={12} sm={5} md={3} lg={2}>
        <Search singleColumn makes={makes} models={models} />
      </Grid>
      <Grid container item xs={12} sm={7} md={9} lg={10} spacing={3}>
        <Grid item xs={12}>
          <CarPagination totalPages={data && data.totalPages} />
        </Grid>
        {((data && data.cars) || []).map((car) => (
          <Grid key={car.id} item xs={12} sm={6}>
            <CarCard car={car} />
          </Grid>
        ))}
        <Grid item xs={12}>
          <CarPagination totalPages={data && data.totalPages} />
        </Grid>
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
      href={{ pathname: '/cars', query: { ...query, page: item.page } }}
      shallow
    >
      <a ref={ref} {...props}></a>
    </Link>
  )
);

export const getServerSideProps: GetServerSideProps<CarListProps> = async (
  ctx
) => {
  const make = getAsString(ctx.query.make);
  //dùng Promise thay vì get từng cái khi muốn get 2 cái cùng lúc chứ ko phải chờ cái nọ xong mới get cái kia
  const [makes, models, pagination] = await Promise.all([
    getMakes(),
    getModels(make),
    getPaginatedCars(ctx.query),
  ]);

  //const makes = await getMakes();
  //const models = await getModels(make); //get all the models when page first load
  return {
    props: {
      makes,
      models,
      cars: pagination.cars,
      totalPages: pagination.totalPages,
    },
  };
};
