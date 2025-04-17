module.exports = (sequelize, DataTypes) => {
    const Emojis = sequelize.define("Emojis", {
      name: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: true, 
      },
      count: {
        type: DataTypes.INTEGER,
        allowNull: false,
        defaultValue: 0, 
      },
      linkId: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },
    });
  
    return Emojis;
  };
  