export const ObjectsUtils = {
  isObjectEmpty(obj: object): boolean {
    return obj === null || obj === undefined;
  },

  isObjectNotEmpty(obj: object): boolean {
    return !this.isObjectEmpty(obj);
  }
};

export const StringUtils = {
  isBlank(str: string | null | undefined): boolean {
    return !str || str.trim() === "";
  },
  isNotBlank(str: string | null | undefined): boolean {
    return !this.isBlank(str);
  }
};
