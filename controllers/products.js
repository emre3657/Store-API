const Product = require("../models/product");

const getAllProductsStatic = async (req, res) => {
  const products = await Product.find({ price: { $gt: 30 } })
    .sort("price")
    .select("name price");
  res.status(200).json({ products, nbHist: products.length });
};

const getAllProducts = async (req, res) => {
  const { featured, company, name, sort, fields, numericFilters } = req.query;
  const queryObject = {};

  if (featured) {
    queryObject.featured = featured === "true" ? true : false;
  }

  if (company) {
    queryObject.company = company;
  }

  if (name) {
    queryObject.name = { $regex: name, $options: "i" };
  }

  if (numericFilters) {
    const operatorMap = {
      ">": "$gt",
      ">=": "$gte",
      "=": "$eq",
      "<": "$lt",
      "<=": "$lte",
    };
    const regEx = /\b(<|>|>=|=|<|<=)\b/g;
    let filters = numericFilters.replace(
      regEx,
      (match) => `-${operatorMap[match]}-`
    );
    const options = ["price", "rating"];
    filters = filters.split(",").forEach((item) => {
      const [field, operator, value] = item.split("-");
      if (options.includes(field)) {
        queryObject[field] = { [operator]: Number(value) };
      }
    });
  }

  console.log(queryObject);

  // prepare the query
  let query = Product.find(queryObject);

  // sort
  if (sort) {
    const sortList = sort.split(",").join(" ");
    query = query.sort(sortList);
  } else {
    query = query.sort("createdAt");
  }

  // fields
  if (fields) {
    const fieldsList = fields.split(",").join(" ");
    query = query.select(fieldsList);
  }

  const page = Number(req.query.page) || 1;
  const limit = Number(req.query.limit) || 10;
  const skip = (page - 1) * limit;

  query = query.skip(skip).limit(limit);
  // productCount: 23
  // limit: 7
  // page: 1 -> [0, 6] -> 7 product
  // page: 2 -> [7, 13] -> 7 product
  // page: 3 -> [14, 20] -> 7 product
  // page: 4 -> [21, 22] -> 2 product

  // send the query to database using await
  const products = await query;
  res.status(200).json({ products, nbHist: products.length });
};

module.exports = {
  getAllProducts,
  getAllProductsStatic,
};
