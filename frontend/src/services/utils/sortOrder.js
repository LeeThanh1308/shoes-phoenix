export const SortOrder = {
  NEWEST: "newest", // Mới nhất
  OLDEST: "oldest", // Cũ nhất
  PRICE_ASC: "price_asc", // Giá tăng dần
  PRICE_DESC: "price_desc", // Giá giảm dần
};

export const sortOptions = [
  {
    value: SortOrder.NEWEST,
    label: "Mới nhất",
    description: "Sắp xếp theo ngày tạo, từ mới nhất đến cũ nhất.",
  },
  {
    value: SortOrder.OLDEST,
    label: "Cũ nhất",
    description: "Sắp xếp theo ngày tạo, từ cũ nhất đến mới nhất.",
  },
  {
    value: SortOrder.PRICE_ASC,
    label: "Giá từ thấp đến cao",
    description: "Sắp xếp theo giá, từ thấp đến cao.",
  },
  {
    value: SortOrder.PRICE_DESC,
    label: "Giá từ cao đến thấp",
    description: "Sắp xếp theo giá, từ cao đến thấp.",
  },
];
