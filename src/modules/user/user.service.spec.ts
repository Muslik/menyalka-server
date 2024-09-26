import { Test, TestingModule } from '@nestjs/testing';
import { ClsModule } from 'nestjs-cls';

import { ConfigModule } from '~/infrastructure/config';
import { User } from '~/infrastructure/database';

import { USER_REPOSITORY } from './user.constants';
import { UserService } from './user.service';

const mockRepository = {
  findAll: jest.fn(),
};

const mockUser: User = {
  id: 1,
  username: 'Test User',
} as User;

describe('User Service', () => {
  let userService: UserService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [ConfigModule, ClsModule],
      providers: [
        {
          provide: USER_REPOSITORY,
          useValue: mockRepository,
        },
        UserService,
      ],
    }).compile();

    userService = module.get<UserService>(UserService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('Should get all users', async () => {
    const mockUsers: User[] = [mockUser, mockUser];

    mockRepository.findAll.mockResolvedValueOnce(mockUsers);
    const result = await userService.getUsers();

    expect(result).toEqual(mockUsers);
    expect(mockRepository.findAll).toHaveBeenCalled();
  });
});
