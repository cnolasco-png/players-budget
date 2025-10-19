type DebouncedFunction<F extends (...args: unknown[]) => void> = ((...args: Parameters<F>) => void) & {
  cancel: () => void;
};

export function debounce<F extends (...args: unknown[]) => void>(fn: F, wait = 500): DebouncedFunction<F> {
  let timer: ReturnType<typeof setTimeout> | null = null;

  const debounced = (...args: Parameters<F>) => {
    if (timer) clearTimeout(timer);
    timer = setTimeout(() => fn(...args), wait);
  };

  debounced.cancel = () => {
    if (timer) {
      clearTimeout(timer);
      timer = null;
    }
  };

  return debounced as DebouncedFunction<F>;
}
