import type { Metadata } from "next";
import { cookies } from "next/headers";
import AdminClient, { type AdminOrder } from "./AdminClient";
import { ADMIN_COOKIE, isValidAdminToken } from "@/lib/admin-auth";
import { isDbConfigured, listOrders } from "@/lib/orders";

export const metadata: Metadata = {
  title: "Admin",
  robots: { index: false, follow: false },
};

export default async function AdminPage() {
  const cookieStore = await cookies();
  const isAuthed = isValidAdminToken(cookieStore.get(ADMIN_COOKIE)?.value);
  const isDbReady = isDbConfigured();

  // Orders load on the server so the client needs no fetch-on-mount effect
  const initialOrders =
    isAuthed && isDbReady ? ((await listOrders()) as AdminOrder[] | null) : null;

  return (
    <AdminClient
      isAuthed={isAuthed}
      isPasswordConfigured={Boolean(process.env.ADMIN_PASSWORD)}
      isDbReady={isDbReady}
      initialOrders={initialOrders}
    />
  );
}
