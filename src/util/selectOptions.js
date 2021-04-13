export const selectOptions = (collection) =>
  collection.map((document) => ({
    label: document.name,
    value: document.id,
  }));
