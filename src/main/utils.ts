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

export { getEnv, isDefined };
