/** Lun–Vie 10:00–15:00 ART (UTC-3). */
export function isMarketOpen(): boolean {
  const art = new Date(
    new Date().toLocaleString("en-US", { timeZone: "America/Argentina/Buenos_Aires" }),
  );
  const day = art.getDay();
  const mins = art.getHours() * 60 + art.getMinutes();
  return day >= 1 && day <= 5 && mins >= 10 * 60 && mins < 15 * 60;
}
