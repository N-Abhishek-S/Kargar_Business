/**
 * Operation-based Image Editor state management.
 * Represents edits as an immutable list of operations to allow unlimited undo/redo.
 */

export type EditorOperationType = 'rotate' | 'crop' | 'brightness' | 'contrast';

export interface EditorOperation {
  id: string;
  type: EditorOperationType;
  args: unknown;
}

export class ImageEditorState {
  private history: EditorOperation[][] = [[]]; // Stack of operation lists
  private currentIndex = 0;

  public get operations(): EditorOperation[] {
    return [...(this.history[this.currentIndex] ?? [])];
  }

  public get canUndo(): boolean {
    return this.currentIndex > 0;
  }

  public get canRedo(): boolean {
    return this.currentIndex < this.history.length - 1;
  }

  public applyOperation(operation: Omit<EditorOperation, 'id'>): void {
    const newOperation: EditorOperation = {
      ...operation,
      id: crypto.randomUUID()
    };
    
    // If we're not at the end of the history (i.e., we undid some steps and are now making a new edit)
    // we discard the "future" redo history.
    if (this.currentIndex < this.history.length - 1) {
      this.history = this.history.slice(0, this.currentIndex + 1);
    }
    
    const nextState = [...this.operations, newOperation];
    this.history.push(nextState);
    this.currentIndex++;
  }

  public undo(): void {
    if (this.canUndo) {
      this.currentIndex--;
    }
  }

  public redo(): void {
    if (this.canRedo) {
      this.currentIndex++;
    }
  }

  public reset(): void {
    this.history = [[]];
    this.currentIndex = 0;
  }
}
