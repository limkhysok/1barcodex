export const dynamic = "force-dynamic";

import { serverFetch } from "@/src/lib/server-fetch";
import { isRedirectError } from "@/src/lib/is-redirect-error";
import { getTransactions, getTransactionStats } from "@/src/services/transaction.service";
import { getInventory } from "@/src/services/inventory.service";
import type { PaginatedInventory, PaginatedTransactions } from "@/src/types/api.types";
import TransactionsClient from "./TransactionsClient";

export default async function TransactionsPage() {
  const [initialPaginatedTransactions, paginatedInventory, initialStats] = await Promise.all([
    getTransactions({ ordering: "-transaction_date" }, serverFetch).catch(
      (e: unknown): PaginatedTransactions => {
        if (isRedirectError(e)) throw e;
        return { count: 0, next: null, previous: null, results: [] };
      }
    ),
    getInventory({}, serverFetch).catch(
      (e: unknown): PaginatedInventory => {
        if (isRedirectError(e)) throw e;
        return { count: 0, next: null, previous: null, results: [] };
      }
    ),
    getTransactionStats(serverFetch).catch((e: unknown) => {
      if (isRedirectError(e)) throw e;
      return null;
    }),
  ]);

  return (
    <TransactionsClient
      initialPaginatedTransactions={initialPaginatedTransactions}
      initialPaginatedInventory={paginatedInventory}
      initialStats={initialStats}
    />
  );
}
