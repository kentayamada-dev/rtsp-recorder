const createQuittingState = () => {
  let isQuitting = false;

  return {
    get: (): boolean => isQuitting,
    set: (value: boolean): void => {
      isQuitting = value;
    },
  };
};

const quitting = createQuittingState();

export { quitting };
