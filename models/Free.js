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
    link2: {
      type: DataTypes.STRING,
      allowNull: true,
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
    linkMV4:{
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

  // Proteção contra apagar ou setar como null após definido
  Free.beforeSave((instance, options) => {
    if (instance.changed('link2') && instance.previous('link2') !== null && instance.link2 === null) {
      instance.link2 = instance.previous('link2');
    }
    if (instance.changed('linkMV4') && instance.previous('linkMV4') !== null && instance.linkMV4 === null) {
      instance.linkMV4 = instance.previous('linkMV4');
    }
  });

  return Free;
};
