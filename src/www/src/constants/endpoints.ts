const Endpoints = {
  Screen: {
    getById: (id: string): string => `/api/screen/${id}`,
  },
  Path: {
    add: (): string => `/api/path`,
  },
  Command: {
    submit: (): string => `/api/command`,
  },
};

export default Endpoints;
