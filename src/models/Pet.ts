import { Model, DataTypes } from "sequelize";
import sequelize from "../database/database";
import User from "./User";

class Pet extends Model {
  public id!: number;
  public user_id!: number;
  public type!: string;
  public race!: string;
  public name!: string;
  public weight!: number;
  public size!: string;
  public age!: number;
  public adopted_at!: Date;
}

Pet.init(
  {
    id: {
      type: DataTypes.INTEGER.UNSIGNED,
      autoIncrement: true,
      primaryKey: true,
    },
    user_id: {
      type: DataTypes.INTEGER.UNSIGNED,
      allowNull: false,
      references: {
        model: User,
        key: "id",
      },
      onUpdate: "CASCADE",
      onDelete: "CASCADE",
    },
    type: {
      type: new DataTypes.STRING(255),
      allowNull: false,
    },
    race: {
      type: new DataTypes.STRING(255),
      allowNull: false,
    },
    name: {
      type: new DataTypes.STRING(255),
      allowNull: false,
    },
    weight: {
      type: DataTypes.INTEGER.UNSIGNED,
      allowNull: false,
    },
    size: {
      type: new DataTypes.STRING(255),
      allowNull: false,
    },
    age: {
      type: DataTypes.INTEGER.UNSIGNED,
      allowNull: true,
    },
    adopted_at: {
      type: DataTypes.DATE,
      allowNull: true,
    },
  },
  {
    tableName: "pets",
    sequelize,
  }
);

Pet.belongsTo(User, { foreignKey: "user_id" });

export default Pet;
