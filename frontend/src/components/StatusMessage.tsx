type StatusMessageProps = {
  kind: 'success' | 'error';
  message: string;
};

export function StatusMessage({ kind, message }: StatusMessageProps) {
  return <div className={`status-message ${kind}`}>{message}</div>;
}
