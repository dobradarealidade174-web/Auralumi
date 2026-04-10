export const getWhatsAppMessage = (type: 'confirmation' | 'reminder' | 'reactivation', data: any) => {
  const { clientName, serviceName, date, professionalName, businessName } = data;
  
  const messages = {
    confirmation: `Olá ${clientName}! Seu agendamento de *${serviceName}* no *${businessName}* foi recebido com sucesso para o dia ${date}. Aguardamos você! ✨`,
    reminder: `Oi ${clientName}! Passando para lembrar do seu horário de *${serviceName}* hoje às ${date} no *${businessName}*. Caso precise desmarcar, nos avise com antecedência. Até logo! 🌸`,
    reactivation: `Olá ${clientName}! Sentimos sua falta no *${businessName}*. Que tal renovar seu visual? Temos horários disponíveis para *${serviceName}* esta semana. Vamos agendar? 💖`
  };

  return messages[type];
};

export const getWhatsAppLink = (phone: string, message: string) => {
  const cleanPhone = phone.replace(/\D/g, '');
  return `https://wa.me/55${cleanPhone}?text=${encodeURIComponent(message)}`;
};
