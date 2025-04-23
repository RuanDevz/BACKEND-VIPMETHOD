// models/stats.js

module.exports = (sequelize, DataTypes) => {
  const Stats = sequelize.define("Stats", {
    totalUsers: {
      type: DataTypes.INTEGER,
      defaultValue: 0, 
    },
    totalVIPs: {
      type: DataTypes.INTEGER,
      defaultValue: 0, 
    },
    totalContentRecommendations: {
      type: DataTypes.INTEGER,
      defaultValue: 0, 
    },
  });

  return Stats;
};
