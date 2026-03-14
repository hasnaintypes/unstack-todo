import { QueryClient } from "@tanstack/react-query";
import { PersistQueryClientProvider } from "@tanstack/react-query-persist-client";
import { createSyncStoragePersister } from "@tanstack/query-sync-storage-persister";
import { ReactQueryDevtools } from "@tanstack/react-query-devtools";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 2 * 60 * 1000, // 2 minutes
      gcTime: 24 * 60 * 60 * 1000, // 24 hours (needed for persistence)
      refetchOnWindowFocus: true,
      retry: 1,
    },
  },
});

const persister = createSyncStoragePersister({
  storage: window.localStorage,
  key: "unstack-query-cache",
});

export function QueryProvider({ children }: { children: React.ReactNode }) {
  return (
    <PersistQueryClientProvider
      client={queryClient}
      persistOptions={{
        persister,
        maxAge: 24 * 60 * 60 * 1000, // 24 hours
        dehydrateOptions: {
          shouldDehydrateQuery: (query) => {
            // Only persist tasks, projects, categories — not trash
            const key = query.queryKey[0] as string;
            return ["tasks", "projects", "categories"].includes(key);
          },
        },
      }}
    >
      {children}
      {import.meta.env.DEV && <ReactQueryDevtools initialIsOpen={false} />}
    </PersistQueryClientProvider>
  );
}
