interface SupabaseLikeError {
  code?: string;
  message: string;
}

export function getSupabaseErrorMessage(error: SupabaseLikeError | null, fallback: string): string {
  return error?.message ?? fallback;
}

export function throwSupabaseError(error: SupabaseLikeError | null, fallback: string): void {
  if (error) {
    throw new Error(getSupabaseErrorMessage(error, fallback));
  }
}
