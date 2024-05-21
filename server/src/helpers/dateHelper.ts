export default function utcToLocal(stringUtc:string) {
    let date = new Date(stringUtc);
    return new Date(
        date.getTime() - date.getTimezoneOffset() * 60000,
    ).toLocaleDateString(navigator.language, {
        day: "2-digit",
        month: "2-digit",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
    });
}

