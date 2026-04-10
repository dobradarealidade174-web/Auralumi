# AgendaPro Estética - SaaS de Agendamento

Este é um MVP de um sistema de agendamento para profissionais de estética.

## 🚀 Como Rodar o Projeto

1. **Firebase Setup**:
   - O sistema utiliza Firebase para Autenticação e Banco de Dados (Firestore).
   - Certifique-se de que o Firebase foi configurado corretamente no painel do AI Studio.
   - As regras de segurança estão no arquivo `firestore.rules`.

2. **Instalação**:
   ```bash
   npm install
   ```

3. **Desenvolvimento**:
   ```bash
   npm run dev
   ```
   O servidor rodará na porta 3000.

4. **Acesso**:
   - Landing Page: `/`
   - Dashboard Profissional: `/dashboard`
   - Link de Agendamento: `/b/:slug` (Configure seu slug em Configurações)

## 🛠 Tecnologias
- **Frontend**: React, Tailwind CSS, Lucide React, Motion.
- **Backend**: Node.js (Express) servindo o SPA.
- **Banco/Auth**: Firebase Firestore & Auth.

## 📱 Funcionalidades
- Agendamento em 3 cliques para clientes.
- Gestão de serviços e horários.
- Dashboard com agenda semanal e diária.
- Geração de links de WhatsApp para comunicação manual (Plano Free).
- Estrutura pronta para automação via API (Plano Pro).

## 🎨 Design
Focado em um público feminino, com cores suaves (Rose/Pink) e interface minimalista mobile-first.
