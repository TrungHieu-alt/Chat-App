const normalizeDate = (iso) => {
  const date = new Date(iso);
  return date.toLocaleDateString("en-US", {
    month: "long",
    day: "numeric",
    year: "numeric",
  });
};

module.exports = {normalizeDate};
