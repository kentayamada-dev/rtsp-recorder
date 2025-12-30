const onValid = <T>(
  value: T | undefined | null,
  fn: (value: T) => void,
): void => {
  if (value != null && value !== "") {
    fn(value);
  }
};

export { onValid };
