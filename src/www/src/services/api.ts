import Config from '@app/config';

export class ApiError extends Error {
  public response: Response;

  public constructor(response: Response) {
    // @NOTE obscene hacks required by TypeScript maintainers.
    // See: https://github.com/microsoft/TypeScript/issues/13965#issuecomment-278570200
    const trueProto = new.target.prototype;

    super(response.statusText);
    this.response = response;

    Object.setPrototypeOf(this, trueProto);
  }
}

/**
 * Simple data access layer for making requests to Apis
 */
class Api {
  private async request(path: string, options: RequestInit = {}): Promise<any> {
    const response = await fetch(`${Config.ApiHost}${path}`, Object.assign({}, options));

    return this.processResponse(response);
  }

  private async requestJson(path: string, options: JsonRequestInit): Promise<any> {
    return this.request(path, Object.assign({}, options, {
      body: JSON.stringify(options.body),
      headers: Object.assign({}, options.headers, {
        'Content-Type': 'application/json',
      }),
    } as RequestInit));
  }

  private async processResponse(response: Response): Promise<any> {
    if (response.status === 200) {
      // Success
      const contentTypeHeader = response.headers.get('Content-Type');

      if (contentTypeHeader && contentTypeHeader.includes('application/json')) {
        return response.json();
      } else {
        return response.text();
      }
    } else {
      // Failure
      throw new ApiError(response);
    }
  }

  /**
   * Make a raw request to any URL.
   * No additional logic on top of `fetch()` beyond parsing the response.
   *
   * @param path URL path to request to, relative to API base
   * @param options Fetch options
   */
  public async raw(path: string, options: RequestInit = {}): Promise<any> {
    const response = await fetch(path, options);

    return this.processResponse(response);
  }

  /**
   * Make a GET request to the API.
   *
   * @param path URL path to request to, relative to API base
   * @param options Fetch options
   */
  public async get<T>(path: string, options: RequestInit = {}): Promise<T> {
    return this.request(path, Object.assign({}, options, {
      method: 'GET',
    } as RequestInit)) as Promise<T>;
  }

  /**
   * Make a POST request to the API, where the body is assumed to be an object
   * that should be JSON-encoded (do not call `JSON.stringify()` yourself, this
   * function does it for you).
   *
   * @param path URL path to request to, relative to API base
   * @param options Fetch options. Body is required but can be any arbitrary JSON (NOT-stringified)
   */
  public async postJson<T>(path: string, options: JsonRequestInit): Promise<T> {
    return this.requestJson(path, Object.assign({}, options, {
      method: 'POST',
    } as JsonRequestInit)) as Promise<T>;
  }

  /**
   * Make a POST request to the API.
   *
   * @param path URL path to request to, relative to API base
   * @param options Fetch options. Body is required
   */
  public async post<T>(path: string, options: RequestInit & { body: BodyInit }): Promise<T> {
    return this.request(path, Object.assign({}, options, {
      method: 'POST',
    } as RequestInit)) as Promise<T>;
  }

  /**
   * Make a PATCH request to the API, where the body is assumed to be an object
   * that should be JSON-encoded (do not call `JSON.stringify()` yourself, this
   * function does it for you).
   *
   * @param path URL path to request to, relative to API base
   * @param options Fetch options. Body is required but can be any arbitrary JSON (NOT-stringified)
   */
  public async patchJson<T>(path: string, options: JsonRequestInit): Promise<T> {
    return this.requestJson(path, Object.assign({}, options, {
      method: 'PATCH',
    } as JsonRequestInit)) as Promise<T>;
  }

  /**
   * Make a PATCH request to the API.
   *
   * @param path URL path to request to, relative to API base
   * @param options Fetch options. Body is required
   */
  public async patch<T>(path: string, options: RequestInit & { body: BodyInit }): Promise<T> {
    return this.request(path, Object.assign({}, options, {
      method: 'PATCH',
    } as RequestInit)) as Promise<T>;
  }
}

interface JsonRequestInit extends RequestInit {
  body: any
}

export default new Api();
