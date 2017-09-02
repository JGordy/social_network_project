'use strict';
module.exports = function(sequelize, DataTypes) {
  var User = sequelize.define('User', {
    name: DataTypes.STRING,
    username: DataTypes.STRING,
    passwordHash: DataTypes.STRING,
    salt: DataTypes.STRING
  }, {});
// linking Post to User. This is the target key
  User.associate = function(models) {
    User.hasMany(models.Post, {
      as: "Posts",
      foreignKey: "userId"
    })
//linking User to Like.
    User.hasMany(models.Like, {
      as: "Likes",
      foreignKey: "userId"
    })
};


  return User;
};
