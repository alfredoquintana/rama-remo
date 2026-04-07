type StatusMessageProps = {
  kind: 'success' | 'error';
  message: string;
};

export function StatusMessage({ kind, message }: StatusMessageProps) {
  return (
    <div
      aria-live={kind === 'error' ? 'assertive' : 'polite'}
      className={`status-message ${kind}`}
      role={kind === 'error' ? 'alert' : 'status'}
    >
      {message}
    </div>
  );
}
