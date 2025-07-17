function IsArray({ data = [], renderElse, children }) {
  return Array.isArray(data) && data.length > 0 ? children : renderElse;
}

export default IsArray;
