export interface TransactionalEmailInputInterface {
  transactionalId: string;
  email: string;
  dataVariables?: Record<string, string | number>;
}
