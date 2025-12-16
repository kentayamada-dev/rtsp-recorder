let isQuitting = false;

export const getIsQuitting = (): boolean => {
  return isQuitting;
};

export const setIsQuitting = (value: boolean): void => {
  isQuitting = value;
};
