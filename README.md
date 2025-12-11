# P2P Payment App

Um aplicativo React Native que demonstra comunicação peer-to-peer (P2P) entre dispositivos usando TCP sockets e descoberta de serviços via Zeroconf/mDNS. Este projeto simula um sistema de pagamentos onde um dispositivo cliente envia transações e outro dispositivo servidor as processa.

## Características

- **Descoberta automática de dispositivos** usando Zeroconf (Bonjour/mDNS)
- **Comunicação TCP bidirecional** entre dispositivos
- **Dois modos de operação**:
  - **Dispositivo A (Cliente)**: Busca e conecta a dispositivos servidores, envia pagamentos
  - **Dispositivo B (Servidor)**: Aceita conexões, processa e responde pagamentos
- **Interface intuitiva** com logs em tempo real
- **Compatível com Android e iOS**

## Tecnologias Utilizadas

- **React Native** - Framework multiplataforma
- **TypeScript** - Tipagem estática e segurança de código
- **react-native-tcp-socket** - Comunicação TCP entre dispositivos
- **react-native-zeroconf** - Descoberta de serviços na rede local

## Pré-requisitos

Antes de começar, certifique-se de ter instalado:

- Node.js (versão 18 ou superior)
- npm ou yarn
- React Native CLI
- Android Studio (para desenvolvimento Android)
- Xcode (para desenvolvimento iOS, apenas macOS)
- JDK 11 ou superior

## Instalação

1. Clone o repositório:

\`\`\`bash
git clone https://github.com/seu-usuario/p2p-payment-app.git
cd p2p-payment-app
\`\`\`

2. Instale as dependências:

\`\`\`bash
npm install
\`\`\`

3. Para iOS, instale os pods:

\`\`\`bash
cd ios
pod install
cd ..
\`\`\`

## Configuração

### Android

As permissões necessárias já estão configuradas no `AndroidManifest.xml`:

- `INTERNET` - Comunicação de rede
- `ACCESS_NETWORK_STATE` - Verificar estado da rede
- `ACCESS_WIFI_STATE` - Acessar informações WiFi
- `CHANGE_WIFI_MULTICAST_STATE` - Necessário para mDNS

### iOS

As configurações necessárias já estão no `Info.plist`:

- `NSBonjourServices` - Descoberta de serviços Bonjour
- `NSLocalNetworkUsageDescription` - Permissão de rede local
- `NSAppTransportSecurity` - Permitir conexões locais

## Executando o Aplicativo

### Android

\`\`\`bash
npm run android
\`\`\`

### iOS

\`\`\`bash
npm run ios
\`\`\`

## Como Usar

### Testando em Dois Dispositivos

1. **Configure o Dispositivo B (Servidor)**:

   - Abra o app no primeiro dispositivo
   - Selecione "DISPOSITIVO B"
   - Toque em "Iniciar Servidor"
   - Aguarde a mensagem "Servidor iniciado na porta 8080"

2. **Configure o Dispositivo A (Cliente)**:

   - Abra o app no segundo dispositivo
   - Selecione "DISPOSITIVO A"
   - Toque em "Buscar Dispositivos"
   - Aguarde até que "PaymentDevice-B" apareça
   - Toque no dispositivo encontrado para conectar

3. **Envie um Pagamento**:
   - No Dispositivo A, insira um valor e descrição
   - Toque em "Enviar Pagamento"
   - Observe o resultado em ambos os dispositivos

### Testando no Emulador

Para testar com emuladores, você precisará configurar port forwarding:

\`\`\`bash

# Android

adb forward tcp:8080 tcp:8080

# iOS - use o mesmo simulador para ambos ou configure networking bridge

\`\`\`

## Estrutura do Projeto

\`\`\`
p2p-payment-app/
├── src/
│ ├── screens/
│ │ ├── DeviceAScreen.tsx # Tela do cliente
│ │ └── DeviceBScreen.tsx # Tela do servidor
│ └── types/
│ └── index.ts # Definições de tipos TypeScript
├── android/ # Código nativo Android
├── ios/ # Código nativo iOS
├── App.tsx # Componente raiz
├── package.json # Dependências e scripts
└── tsconfig.json # Configuração TypeScript
\`\`\`

## Funcionalidades Técnicas

### Descoberta de Serviços

O app usa Zeroconf (mDNS/DNS-SD) para descoberta automática:

- **Tipo de serviço**: `_payment-device._tcp.local.`
- **Porta padrão**: 8080
- **Nome do serviço**: PaymentDevice-B

### Protocolo de Comunicação

**Formato de Pagamento (Cliente → Servidor)**:

\`\`\`json
{
"id": "PAY_1234567890",
"amount": 100.50,
"description": "Teste de pagamento",
"timestamp": 1234567890
}
\`\`\`

**Formato de Resposta (Servidor → Cliente)**:

\`\`\`json
{
"id": "PAY_1234567890",
"success": true,
"message": "Pagamento de R$ 100.50 aprovado",
"timestamp": 1234567890
}
\`\`\`

## Troubleshooting

### Dispositivos não são encontrados

- Verifique se ambos os dispositivos estão na mesma rede WiFi
- Certifique-se de que o firewall não está bloqueando a porta 8080
- Reinicie o servidor (Dispositivo B) e tente buscar novamente

### Erro de conexão

- Verifique se o servidor está rodando antes de conectar
- Confirme que as permissões foram concedidas no Android
- Para iOS, aceite a permissão de rede local quando solicitado

### Build falhou

\`\`\`bash

# Limpar cache e reinstalar

cd android && ./gradlew clean
cd ..
npm install
npm run android
\`\`\`

## Limitações Conhecidas

- A descoberta via Zeroconf pode não funcionar em redes corporativas com multicast desabilitado
- Emuladores podem ter dificuldade com descoberta de rede; prefira dispositivos físicos
- O processamento de pagamento é simulado (70% de aprovação aleatória)

## Melhorias Futuras

- [ ] Adicionar criptografia TLS nas conexões
- [ ] Implementar autenticação entre dispositivos
- [ ] Adicionar histórico persistente de transações
- [ ] Suporte para múltiplas conexões simultâneas
- [ ] Interface para configurar porta e nome do serviço
- [ ] Testes unitários e de integração

## Contribuindo

Contribuições são bem-vindas! Sinta-se à vontade para abrir issues ou pull requests.

1. Faça um fork do projeto
2. Crie uma branch para sua feature (`git checkout -b feature/nova-feature`)
3. Commit suas mudanças (`git commit -m 'Adiciona nova feature'`)
4. Push para a branch (`git push origin feature/nova-feature`)
5. Abra um Pull Request

## Licença

Este projeto está sob a licença MIT. Veja o arquivo `LICENSE` para mais detalhes.

## Contato

Para dúvidas ou sugestões, abra uma issue no GitHub.

---

Desenvolvido como projeto de aprendizado para comunicação P2P em React Native.
