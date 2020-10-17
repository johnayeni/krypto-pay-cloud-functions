export function getCategoriesForCountry(categories: any[], country: string) {
  return categories.filter(category => category.country === country);
}