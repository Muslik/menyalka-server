import { UserEntity } from './user/domain/user.entity';
import { Email } from './user/domain/value-objects/email.value-object';
import { Sex, SexEnum } from './user/domain/value-objects/sex.value-object';
import { Username } from './user/domain/value-objects/username.value-object';

const entity = UserEntity.create({
  sex: new Sex({
    value: SexEnum.Male,
  }),
  email: new Email({
    value: 'arbat@mail.ru',
  }),
  username: new Username({
    value: 'dzhab',
  }),
});

entity.makeAdmin();


console.log("E", entity);
