import {Address} from "web3";

export const debounce = (callback: CallableFunction, wait: number = 500) => {
  let timeoutId: any;
  return (...args: any[]) => {
    clearTimeout(timeoutId);
    timeoutId = setTimeout(() => {
      callback(...args);
    }, wait);
  };
};

export const numberFormatter = (number: string|number|BigInt, locale: string = 'en-US') => {
  return (+number).toLocaleString(locale, {
    maximumFractionDigits: number > 1000000 ? 1 : 0,
    notation: number > 1000000 ? 'compact' : "standard"
  });
};

export const currencyFormatter = (number: number, currency: string = 'USD', locale: string = 'en-US') => {
  return number.toLocaleString(locale, {
    maximumFractionDigits: 0,
    style: "currency",
    currency
  });
}

export const formatAddress = (account: Address|string|null|undefined) => {
  const acc = account || '';
  return acc.substring(0, 6) + '...' + acc.substring(acc.length - 4)
};
