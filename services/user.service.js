const { User } = require("../models");

exports.createUser = async (values) => {
  return await User.create({ ...values });
};
