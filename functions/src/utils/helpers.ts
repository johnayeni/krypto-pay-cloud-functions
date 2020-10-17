export function getCategoriesForCountry(categories: any[], country: string) {
  return categories.filter((category) => category.country === country);
}

export function getCategoriesForMobile(categories: any[]) {
  return categories.filter((category) => category.label_name.toLowerCase() === "mobile number");
}

export function getCategoriesForBillerName(categories: any[], billerName: string) {
  return categories.filter((category) => category.biller_name === billerName);
}

export function sanitizeCategories(categories: any[]) {
  return categories.map((category) => {
    const {
      default_commission,
      date_added,
      is_airtime,
      commission_on_fee,
      ...sanitizedCategory
    } = category;
    return sanitizedCategory;
  });
}
