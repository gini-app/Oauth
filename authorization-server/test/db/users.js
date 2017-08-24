'use strict';

const chai      = require('chai');
const { users } = require('../../db');
const sinonChai = require('sinon-chai');

chai.use(sinonChai);
const expect = chai.expect;

describe('users', () => {
  it('should not find an invalid user', () =>
    users.find('')
    .then(token => expect(token).to.be.undefined));

  it('should find a user by id 1', () =>
    users.find('1')
    .then((user) => {
      expect(user).to.contain({
        user_id: 1,
        username: 'testuser',
        password: 'testpassword',
        name: 'tester',
      });
    }));

  it('should find a user by username bob', () =>
    users.findByUsername('testuser')
    .then((user) => {
      expect(user).to.contain({
        user_id: 1,
        username: 'testuser',
        password: 'testpassword',
        name: 'tester',
      });
    }));
});
