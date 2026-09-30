export const sendEmail = async (type: string, data: any) => {
  console.log(`Enviando email do tipo ${type}`, data);
  return { success: true };
};
