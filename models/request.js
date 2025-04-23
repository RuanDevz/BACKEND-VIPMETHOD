module.exports = (sequelize, DataTypes) => {
    const Request = sequelize.define('Request', {
      userName: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      content: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      status: {
        type: DataTypes.STRING,
        allowNull: false,
        defaultValue: 'pending',
      },
      dateRequested: {
        type: DataTypes.DATE,
        allowNull: false,
        defaultValue: DataTypes.NOW, 
      },
    }, {
      timestamps: false, 
      tableName: 'requests',
    });
  
    return Request;
  };
  