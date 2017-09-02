'use strict';
module.exports = function(sequelize, DataTypes) {
  var Post = sequelize.define('Post', {
    message: DataTypes.STRING(140),
    likes: DataTypes.INTEGER
  }, {});
// linking Post to User. This is the source key
  Post.associate = function(models) {
    Post.belongsTo(models.User, {
      as: "Users",
      foreignKey: "userId"
    })
//linking Post to Like
    Post.hasMany(models.Like, {
      as: "Likes",
      foreignKey: "postId"
    })
  };


  return Post;
};
