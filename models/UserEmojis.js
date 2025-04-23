module.exports = (sequelize, DataTypes) => {
  const UserEmojis = sequelize.define('UserEmojis', {
    userId: {
      type: DataTypes.INTEGER,
      allowNull: false
    },
    linkId: {
      type: DataTypes.INTEGER,
      allowNull: false
    },
    emojiName: {
      type: DataTypes.STRING,
      allowNull: false
    },
    count: {  
      type: DataTypes.INTEGER,
      defaultValue: 0  
    }
  });

  return UserEmojis;
};
