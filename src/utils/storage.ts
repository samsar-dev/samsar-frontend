export const setItem = (key: string, value: string): void => {
  try {
    window.localStorage.setItem(key, value);
  } catch (error: unknown) {
    console.error('Error storing item:', error);
  }
};

export const getItem = (key: string): string | null => {
  try {
    return window.localStorage.getItem(key);
  } catch (error: unknown) {
    console.error('Error retrieving item:', error);
    return null;
  }
};

export const removeItem = (key: string): void => {
  try {
    window.localStorage.removeItem(key);
  } catch (error: unknown) {
    console.error('Error removing item:', error);
  }
};
