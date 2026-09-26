export const formatDate = (matchDate: string) => {
    return new Date(matchDate)
        .toLocaleString("en-GB", {
            day: "2-digit",
            month: "2-digit",
            year: "numeric",
            hour: "2-digit",
            minute: "2-digit",
        })
        .replace(/\//g, ".")
        .replace(",", "");
}