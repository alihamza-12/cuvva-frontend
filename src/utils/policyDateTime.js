const LONDON_TIME_ZONE = "Europe/London";

const zonedParts = (instant) =>
  Object.fromEntries(
    new Intl.DateTimeFormat("en-GB", {
      timeZone: LONDON_TIME_ZONE,
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
      hourCycle: "h23",
    })
      .formatToParts(instant)
      .filter((part) => part.type !== "literal")
      .map((part) => [part.type, Number(part.value)]),
  );

export const policyDateTimeToInstant = (dateValue, timeValue) => {
  const date = new Date(dateValue);
  const match = /^(\d{1,2}):(\d{2})$/.exec(String(timeValue || ""));
  if (Number.isNaN(date.getTime()) || !match) return null;
  const year = date.getUTCFullYear();
  const month = date.getUTCMonth() + 1;
  const day = date.getUTCDate();
  const hour = Number(match[1]);
  const minute = Number(match[2]);
  const desired = Date.UTC(year, month - 1, day, hour, minute);
  let instant = new Date(desired);

  for (let index = 0; index < 3; index += 1) {
    const parts = zonedParts(instant);
    const represented = Date.UTC(
      parts.year,
      parts.month - 1,
      parts.day,
      parts.hour,
      parts.minute,
      parts.second,
    );
    instant = new Date(desired - (represented - instant.getTime()));
  }
  const verified = zonedParts(instant);
  if (
    verified.year !== year || verified.month !== month || verified.day !== day ||
    verified.hour !== hour || verified.minute !== minute
  ) return null;
  return instant;
};
