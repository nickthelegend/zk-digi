import { useState, useEffect } from "react";
import { db } from "@/lib/db";

export function useDbQuery(queryFn: (address: string) => Promise<any>, address: string | null) {
  const [data, setData] = useState<any>(undefined);
  const [error, setError] = useState<any>(null);

  useEffect(() => {
    if (!address) {
      setData(undefined);
      return;
    }

    let isMounted = true;
    queryFn(address)
      .then((res) => {
        if (isMounted) setData(res);
      })
      .catch((err) => {
        if (isMounted) setError(err);
      });

    return () => {
      isMounted = false;
    };
  }, [address, queryFn]);

  return data;
}

export function useDbMutation(mutationFn: (data: any) => Promise<any>) {
  return mutationFn;
}
