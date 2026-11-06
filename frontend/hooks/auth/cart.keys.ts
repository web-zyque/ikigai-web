export const cartKeys = {
  all: ["cart"] as const,
  user: (userId: string) => [...cartKeys.all, "user", userId] as const,
  lists: () => [...cartKeys.all, "list"] as const,
  details: () => [...cartKeys.all, "detail"] as const,
  detail: (id: string) => [...cartKeys.details(), id] as const,
};
