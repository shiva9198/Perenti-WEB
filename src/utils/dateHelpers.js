export function parseMeetupTimes(dateStr, timeStr) {
  try {
    const cleanDate = dateStr.replace(/\b(\d+)(st|nd|rd|th)\b/g, "$1");
    const parts = timeStr.split(/[-–]/);

    const startTimeStr = parts[0].trim();
    let endTimeStr =
      parts.length > 1 ? parts[1].replace(/\(.*\)/g, "").trim() : startTimeStr;

    const startParsed = Date.parse(`${cleanDate} ${startTimeStr}`);
    const endParsed = Date.parse(`${cleanDate} ${endTimeStr}`);

    const start = isNaN(startParsed)
      ? new Date(Date.now() - 1000)
      : new Date(startParsed);
    let end = isNaN(endParsed)
      ? new Date(start.getTime() + 2 * 60 * 60 * 1000)
      : new Date(endParsed);

    return { start, end };
  } catch {
    const start = new Date(Date.now() - 1000);
    return { start, end: new Date(start.getTime() + 2 * 60 * 60 * 1000) };
  }
}
