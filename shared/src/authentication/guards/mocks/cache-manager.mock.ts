import { CacheKeyPrefix } from '../../../cache/enums/cache-key-prefix.enum';

export class CacheManagerMock {
  async get<T>(key: string): Promise<T | undefined> {
    // logout
    if (key.startsWith(CacheKeyPrefix.AUTH_SESSION_LOGOUT)) {
      switch (key) {
        case `${CacheKeyPrefix.AUTH_SESSION_LOGOUT}:01e57c05-45d6-4d6f-8f30-2bddce37df5f:1708003432088`:
          return {} as T;
      }
    }

    // password change
    if (key.startsWith(CacheKeyPrefix.AUTH_PASSWORD_CHANGE)) {
      switch (key) {
        case `${CacheKeyPrefix.AUTH_PASSWORD_CHANGE}:3e699250-4bc4-4c3d-a0ea-0aa3dc17abd5`:
          return {
            // subtract 5 seconds to help in tests
            changedAt: new Date().getTime() - 5000,
          } as T;
      }
    }

    return null;
  }
}
