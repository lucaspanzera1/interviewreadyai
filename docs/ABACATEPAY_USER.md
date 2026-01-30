# Integração de Usuário com AbacatePay

## Fluxo de Criação de Cliente na AbacatePay

### 1. Cadastro ou atualização de perfil
Quando um usuário cadastra ou atualiza seu perfil no sistema, ele deve informar obrigatoriamente:
- Nome
- E-mail
- Telefone (cellphone)
- CPF (taxid)

### 2. Integração automática
Ao salvar o perfil:
- O backend verifica se o usuário já possui um `abacatepayCustomerId`.
- Se não possuir e todos os dados obrigatórios estiverem presentes, o backend chama a API da AbacatePay para criar o cliente.
- O ID retornado pela AbacatePay é salvo no campo `abacatepayCustomerId` do usuário no banco de dados.

### 3. Utilização no pagamento
- Sempre que o usuário for realizar um pagamento, o sistema utiliza o `abacatepayCustomerId` para criar a cobrança na AbacatePay.
- Se o usuário não tiver esse ID, o pagamento não é permitido até que o perfil esteja completo.

### Observações
- O processo é transparente para o usuário: basta completar o perfil e o cadastro na AbacatePay é feito automaticamente.
- Caso haja erro na criação do cliente na AbacatePay, o backend apenas registra o erro e não impede a atualização do perfil.
