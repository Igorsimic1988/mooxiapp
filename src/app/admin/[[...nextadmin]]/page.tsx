import { NextAdmin, PageProps } from "@premieroctet/next-admin";
import { getNextAdminProps } from "@premieroctet/next-admin/appRouter";
import { prisma } from "../../../../prisma";
import "../../../../nextAdminCss.css";
import options from "../../../../nextAdminOptions";

export default async function AdminPage({
  params,
  searchParams,
}: PageProps) {
  const sp = await searchParams
  const props = await getNextAdminProps({
    params: params.nextadmin,
    searchParams: sp,
    basePath: "/admin",
    apiBasePath: "/api/admin",
    prisma,
    options
  });
 
  return <NextAdmin {...props} />;
}