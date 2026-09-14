import { useEffect, useState } from "react";

export function useSelectOptions<T>(
  fetchFn: () => Promise<T[]>,
  labelKey: keyof T
) {
  const [data, setData] = useState<T[]>([]);

  useEffect(() => {
    const fetchData = async () => {
      const res = await fetchFn();
      setData(res);
    };

    fetchData();
  }, []);

  const options = data.map((item: any) => ({
    value: String(item.id),
    label: item[labelKey],

    data: item
  }));

  return { data, options };
}