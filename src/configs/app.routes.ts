const usersRoot = 'users';

export const routerV1 = {
  version: 'v1',
  user: {
    root: usersRoot,
    delete: `/${usersRoot}/:id`
  }
}
