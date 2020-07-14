import { getAsString } from "../getAsString";
import Pagination from "@material-ui/lab/Pagination";
import PaginationItem from "@material-ui/lab/PaginationItem";
import { PaginationRenderItemParams } from "@material-ui/lab";
import { useRouter } from "next/router";
import Link from "next/link";
import { ParsedUrlQuery } from "querystring";
import { forwardRef } from "react";

export function CarPagination({ totalPages }: { totalPages: number }) {
  const { query } = useRouter();
  return (
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
