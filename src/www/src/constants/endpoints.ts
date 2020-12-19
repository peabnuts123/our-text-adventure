const Endpoints = {
  Screen: {
    getById: (id: string): string => `/api/screen/${id}`,
  },
  Path: {
    add: (): string => `/api/path`,
  },
};

export default Endpoints;
