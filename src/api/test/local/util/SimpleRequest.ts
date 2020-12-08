interface SimpleRequest {
  path: string;
  pathParams?: Record<string, string>;
  httpMethod?: string;
  queryParams?: Record<string, string>;
  headers?: Record<string, string>;
  body?: string;
}

export default SimpleRequest;
