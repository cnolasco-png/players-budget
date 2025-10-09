export function debounce<F extends (...args: any[]) => void>(fn: F, wait = 500) {
  let timer: ReturnType<typeof setTimeout> | null = null;
  const debounced = (...args: Parameters<F>) => {
    if (timer) clearTimeout(timer);
    // eslint-disable-next-line @typescript-eslint/no-misused-promises
    timer = setTimeout(() => fn(...args), wait);
  };
  debounced.cancel = () => {
    if (timer) {
      clearTimeout(timer);
      timer = null;
    }
  };
  return debounced as F & { cancel: () => void };
}
