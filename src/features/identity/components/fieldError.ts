export function fieldError(fields: Record<string, string[]>, name: string): string | undefined {
  return fields[name]?.[0]
}
