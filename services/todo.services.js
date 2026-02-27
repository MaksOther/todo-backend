import { DataTypes, Sequelize } from "sequelize";

const dbUrl = process.env.DATABASE_URL || "postgres://postgres:123123@localhost:5432/postgres";
const sequelize = new Sequelize(dbUrl, {
  dialect: "postgres",
  dialectOptions: {
    ssl: process.env.NODE_ENV === "production" ? {
      require: true,
      rejectUnauthorized: false,
    } : false,
  },
});

const Todo = sequelize.define(
  "Todo",
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    title: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    completed: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: false,
    },
  },
  {
    tableName: "todos",
    updatedAt: false,
    createdAt: false,
  },
);

export const getAll = async () => {
  return await Todo.findAll({
    order: ["title"],
  });
};

export const getById = async (id) => {
  return Todo.findByPk(id);
};

export const create = (title) => {
  return Todo.create({ title });
};

export const update = async (id, data, transaction = null) => {
  const currentTodo = await getById(id);
  if (!currentTodo) return null;

  const isCompleted =
    data.completed !== undefined
      ? data.completed === true || data.completed === "true"
      : currentTodo.completed;

  await currentTodo.update({
    title: data.title !== undefined ? data.title : currentTodo.title,
    completed: isCompleted,
  }, { transaction });

  return currentTodo;
};

export const updateMany = async (items) => {
  await sequelize.transaction(async (t) => {
    await Promise.all(items.map((item) => update(item.id, item, t)));
  });

  return getAll();
};

export const remove = async (id) => {
  return await Todo.destroy({ where: { id } });
};

export { sequelize };