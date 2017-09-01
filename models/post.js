'use strict';
module.exports = function(sequelize, DataTypes) {
  var Post = sequelize.define('Post', {
    message: DataTypes.STRING(140),
    likes: DataTypes.INTEGER
  }, {});
// linking Post to User. This is the source key
  Post.associate = function(models) {
    Post.belongsTo(models.User, {
      foreignKey: "userId"
    })
//linking Post to Like
    Post.belongsToMany(models.User, {
      foreignKey: "postId",
      otherKey: "userId",
      through: "Likes"
    })
  };


  return Post;
};
