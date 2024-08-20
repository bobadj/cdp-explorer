
export const debounce = (callback: CallableFunction, wait: number = 500) => {
  let timeoutId: any;
  return (...args: any[]) => {
    clearTimeout(timeoutId);
    timeoutId = setTimeout(() => {
      callback(...args);
    }, wait);
  };
};

export const numberFormatter = (number: number, locale: string = 'en-US') => {
  return number.toLocaleString(locale, {
    maximumFractionDigits: number > 1000000 ? 1 : 0,
    notation: number > 1000000 ? 'compact' : "standard"
  });
};
