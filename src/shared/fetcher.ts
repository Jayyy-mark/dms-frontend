export const fetcher = async (url:string) => {
    const res = await fetch(`http://localhost:8000${url}`);

    if (!res.ok)throw new Error("Failed to fetch data!");
    const data = await res.json();
    return data;
}