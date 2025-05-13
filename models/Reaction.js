// models/Reaction.js
module.exports = (sequelize, DataTypes) => {
  const Reaction = sequelize.define('Reaction', {
      contentId: {
          type: DataTypes.INTEGER,
          allowNull: false,
      },
      contentType: {
          type: DataTypes.ENUM('free', 'vip'),
          allowNull: false,
      },
      userId: {
          type: DataTypes.INTEGER,
          allowNull: false,
      },
      emoji: {
          type: DataTypes.STRING,
          allowNull: false,
      },
      count: { 
          type: DataTypes.INTEGER,
          defaultValue: 0,
      }
  });

  return Reaction;
};