// models/Vip.js
module.exports = (sequelize, DataTypes) => {
    const Vip = sequelize.define('Vip', {
      name: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      link: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      linkP:{
        type: DataTypes.STRING,
        allowNull: true,
      },
      linkG:{
        type: DataTypes.STRING,
        allowNull: true,
      },
      linkMV1:{
        type: DataTypes.STRING,
        allowNull: true,
      },
      linkMV2:{
        type: DataTypes.STRING,
        allowNull: true,
      },
      linkMV3:{
        type: DataTypes.STRING,
        allowNull: true,
      },
      slug:{
        type: DataTypes.STRING,
        allowNull: false,
      },
      category: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      postDate: {
        type: DataTypes.DATE,
        allowNull: false,
        defaultValue: DataTypes.NOW,
      },
      createdAt: {
        type: DataTypes.DATE, // ou DataTypes.DATEONLY se for apenas a data
        allowNull: false,
        defaultValue: DataTypes.NOW, // se necessário, define o valor padrão
      }
    });
  
    return Vip;
  };
  