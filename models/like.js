'use strict';
module.exports = function(sequelize, DataTypes) {
  var Like = sequelize.define('Like', {
    userId: DataTypes.INTEGER,
    postId: DataTypes.INTEGER
  }, {});

  Like.associate = function(models) {
    Like.belongsTo(models.User, {
      as: "Users",
      foreignKey: "userId"
    })
    Like.belongsTo(models.Post, {
      as: "Posts",
      foreignKey: "postId"
    })
  }

  return Like;
};
