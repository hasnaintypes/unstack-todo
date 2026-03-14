export const queryKeys = {
  tasks: {
    all: (userId: string) => ["tasks", "all", userId] as const,
    trash: (userId: string) => ["tasks", "trash", userId] as const,
  },
  projects: {
    all: (userId: string) => ["projects", "all", userId] as const,
  },
  categories: {
    all: (userId: string) => ["categories", "all", userId] as const,
  },
};
