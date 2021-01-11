const Endpoints = {
  Screen: {
    getById: (id: string): string => `/api/screen/${id}`,
  },
  Command: {
    submit: (): string => `/api/command`,
    addPath: (): string => `/api/path`,
  },
};

export default Endpoints;
