// Libs
var _ = require('lodash');
var Promise = require('bluebird');
// Helpers
var errorParse = require('../../helpers/error_parse');
// Serializers
var UserCardDetailSerializer = require('../../serializers/user_cards/user_card_detail');
var CardDetailSerializer = require('../../serializers/cards/card_detail');
var UserDetailSerializer = require('../../serializers/users/user_detail');
var CompanyDetailSerializer = require('../../serializers/companies/company_detail');
// Others
var ApiError = require('../../errors/api_error');
var sequelize = require('../../models');

module.exports.call = function(company, userId) {
  return new Promise.try(function promise() {
    try {
      if (!_.isObject(company) || !userId) {
        throw new Error('Parameters are incorrect.');
      }

      return sequelize.UserCard.findAll({
        where: {companyId: company.id, userId: userId},
        attributes: ['id', 'sealedDates', 'createdAt'],
        include: [
          {model: sequelize.Card, attributes: ['stamps', 'title', 'description', 'color', 'id', 'createdAt']},
          {model: sequelize.User, attributes: ['id', 'name', 'email', 'identifier', 'birthdate', 'avatar', 'createdAt']}
        ],
        order: '"createdAt" DESC'
      }).then(function success(userCards) {
        if (userCards.length === 0) return {result: userCards, status: 200};
        return {
          result: userCards.map(function map(userCard) {
            return _.merge(
              UserCardDetailSerializer.serialize(userCard),
              {
                relationships: {
                  card: CardDetailSerializer.serialize(userCard.Card),
                  user: UserDetailSerializer.serialize(userCard.User),
                  company: CompanyDetailSerializer.serialize(company)
                }
              }
            );
          }),
          status: 200
        };
      }).catch(function error(err) {
        throw new ApiError('User Cards could not be found.', 422, errorParse(err));
      });
    } catch (e) {
      throw new ApiError('User Cards could not be found.', 422, errorParse(e));
    }
  });
};
