const getEnv = (key: string): string => {
  const value = process.env[key];

  if (!value) {
    throw new Error(`Missing environment variable: ${key}`);
  }
  return value;
};

const isDefined = <T>(value: T | null | undefined): T => {
  if (value === null || value === undefined) {
    throw new Error("Value is null or undefined");
  }
  return value;
};

const formatDate = (date: Date) => {
  const pad = (num: number) => String(num).padStart(2, "0");

  const year = date.getFullYear();
  const month = pad(date.getMonth() + 1);
  const day = pad(date.getDate());
  const hours = pad(date.getHours());
  const minutes = pad(date.getMinutes());
  const seconds = pad(date.getSeconds());

  const offsetMinutesTotal = -date.getTimezoneOffset();
  const sign = offsetMinutesTotal >= 0 ? "+" : "-";
  const abs = Math.abs(offsetMinutesTotal);
  const offsetHour = pad(Math.floor(abs / 60));
  const offsetMinute = pad(abs % 60);

  return {
    date: `${year}-${month}-${day}`,
    hour: `${year}-${month}-${day}_${hours}`,
    minute: `${year}-${month}-${day}_${hours}-${minutes}`,
    second: `${year}-${month}-${day}_${hours}-${minutes}-${seconds}`,
    iso8601WithOffset: `${year}-${month}-${day}T${hours}:${minutes}:${seconds}${sign}${offsetHour}:${offsetMinute}`,
  };
};

export { getEnv, isDefined, formatDate };
