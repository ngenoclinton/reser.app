function convertToSubcurrency(amount, subcurrencyFactor=100) {
  return Math.round(amount * subcurrencyFactor);
}; 

export default convertToSubcurrency;