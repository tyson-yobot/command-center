import { hasPermission, PERMISSIONS } from '../server/auth';

describe('hasPermission', () => {
  test('returns true when permission allowed for role', () => {
    const user = { role: 'admin' } as any;
    expect(hasPermission(user, PERMISSIONS.FULL_SYSTEM_ACCESS)).toBe(true);
  });

  test('returns false when permission not allowed', () => {
    const user = { role: 'guest' } as any;
    expect(hasPermission(user, PERMISSIONS.FULL_SYSTEM_ACCESS)).toBe(false);
  });
});
