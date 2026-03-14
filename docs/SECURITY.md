# Segurança e LGPD — Prontuário HOF

## Classificação de Dados

| Dado | Classificação LGPD | Proteção |
|------|-------------------|----------|
| CPF | Dado pessoal | Criptografia AES-256-GCM |
| Nome, telefone | Dado pessoal | Controle de acesso |
| Prontuário | Dado sensível (saúde) | Criptografia + Audit log |
| Fotos clínicas | Dado sensível (saúde) | Storage privado + Audit log |
| Anamnese | Dado sensível (saúde) | Criptografia + Audit log |

## Medidas de Segurança Implementadas

### 1. Criptografia de dados sensíveis
- AES-256-GCM para CPF e contatos
- Hash SHA-256 de integridade dos prontuários
- Chave de criptografia gerenciada via variável de ambiente

### 2. Autenticação
- JWT com expiração de 8 horas
- Hashing de senhas com bcrypt (12 rounds)
- Rate limiting: 5 tentativas / 15 minutos

### 3. Autorização (Multi-tenant)
- Profissional só acessa dados da própria clínica
- Middleware verifica clinicaId em todas as rotas
- ADMIN da clínica acessa tudo da clínica

### 4. Auditoria de Acesso
- Log de quem acessou qual prontuário, quando e de qual IP
- Obrigatório por CFM (Resolução 1.638/2002)
- Registro de operações: INSERT, UPDATE, DELETE, SELECT

### 5. Retenção de Dados
- **Prontuários**: mínimo 20 anos (Resolução CFM 1.638/2002)
- **Soft delete apenas** — nunca deleção física de prontuário
- **TCLE**: mesmo prazo do prontuário

### 6. Direitos do Titular (LGPD)
- Acesso aos próprios dados (Art. 18, II)
- Correção de dados (Art. 18, III)
- Portabilidade (Art. 18, V)
- Prazo de resposta: 15 dias

## Compliance Checklist

- [x] Criptografia de dados sensíveis em repouso
- [x] Audit Log implementado
- [x] Soft delete em prontuários
- [x] Hash de integridade
- [ ] Rate limiting nas rotas de auth
- [ ] Exportação de dados (portabilidade)
- [ ] Termos de uso e política de privacidade
- [ ] Notificação de vazamento em até 72h
