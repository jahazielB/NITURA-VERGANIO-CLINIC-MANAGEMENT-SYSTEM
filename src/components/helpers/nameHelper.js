export function fullName(name) {
  if (!name) return "fetching....";
  return name
    .split(" ")
    .map((letters) => {
      return letters.charAt(0).toUpperCase() + letters.slice(1);
    })
    .join(" ");
}
export const upperCaseFirstLetter = (word) => {
  if (!word) return "";
  return word
    .trim()
    .split(" ")
    .map((letters) => {
      return letters.charAt(0).toUpperCase() + letters.slice(1);
    })
    .join(" ");
};
