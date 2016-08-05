// Libs
var _ = require('lodash');
var Promise = require('bluebird');
// Helpers
var errorParse = require('../../helpers/error_parse');
// Serializers
var UserCardDetailSerializer = require('../../serializers/user_cards/user_card_detail');
var CompanyDetailSerializer = require('../../serializers/companies/company_detail');
var CardDetailSerializer = require('../../serializers/cards/card_detail');
var UserDetailSerializer = require('../../serializers/users/user_detail');
// Others
var ApiError = require('../../errors/api_error');
var sequelize = require('../../models');

module.exports.call = function(user, id) {
  return new Promise.try(function promise() {
    try {
      if (!_.isObject(user) || !id) {
        throw new Error('Parameters are incorrect.');
      }

      return sequelize.UserCard.findOne({
        where: {userId: user.id, id: id},
        attributes: ['id', 'sealedDates', 'createdAt'],
        include: [
          {model: sequelize.Card, attributes: ['stamps', 'title', 'description', 'color', 'id', 'createdAt']},
          {model: sequelize.Company, attributes: ['id', 'name', 'email', 'identifier', 'about', 'address', 'phone', 'avatar', 'createdAt']}
        ]
      }).then(function success(userCard) {
        if (!userCard) throw new Error('User Card not found');
        return {
          result: _.merge(
            UserCardDetailSerializer.serialize(userCard),
            {
              relationships: {
                card: CardDetailSerializer.serialize(userCard.Card),
                company: CompanyDetailSerializer.serialize(userCard.Company),
                user: UserDetailSerializer.serialize(user)
              }
            }
          ),
          status: 200
        };
      }).catch(function error(err) {
        throw new ApiError('User Card not found.', 422, errorParse(err));
      });
    } catch (e) {
      throw new ApiError('User Card not found.', 422, errorParse(e));
    }
  });
};
