module.exports = (sequelize, DataTypes) => {
  const Free = sequelize.define("Free", {
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
      allowNull: true,
    },
    category: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    postDate: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: DataTypes.NOW,
    },
  });

  return Free;
};
