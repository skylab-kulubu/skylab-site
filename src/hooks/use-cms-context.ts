import { useSession } from "next-auth/react";

export function useCmsContext() {
  const { data: session } = useSession();
  const user = session?.user as any;
  const isAdmin = user?.clientRoles?.includes("cms:access") || false;

  return {
    isAdmin,
    setActiveBlock: (blockPath: string) => {},
  };
}
