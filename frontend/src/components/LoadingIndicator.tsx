export function LoadingIndicator() {
  return (
    <div
      className="flex justify-start pb-2"
      aria-busy="true"
      aria-label="Waiting for reply"
    >
      <div className="flex gap-1 rounded-2xl bg-muted px-4 py-3">
        <span className="h-2 w-2 animate-bounce rounded-full bg-muted-foreground/60 [animation-delay:-0.3s]" />
        <span className="h-2 w-2 animate-bounce rounded-full bg-muted-foreground/60 [animation-delay:-0.15s]" />
        <span className="h-2 w-2 animate-bounce rounded-full bg-muted-foreground/60" />
      </div>
    </div>
  );
}
