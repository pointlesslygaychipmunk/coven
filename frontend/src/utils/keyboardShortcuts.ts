/**
 * Keyboard Shortcuts Utility
 * 
 * This utility helps implement and manage keyboard shortcuts throughout the application.
 * It provides a consistent way to register and handle shortcuts.
 */

// Types for keyboard shortcuts
export interface Shortcut {
  key: string;            // Key or key combination (e.g., 'g', 'Shift+G')
  callback: () => void;   // Function to call when shortcut is triggered
  description: string;    // Description for help dialogs
  context?: string;       // Optional context where this shortcut applies
  allowInInputs?: boolean; // Whether to allow this shortcut in input fields
}

export interface ShortcutCategory {
  title: string;
  shortcuts: ShortcutInfo[];
}

export interface ShortcutInfo {
  key: string;
  description: string;
  context?: string;
}

class KeyboardShortcutManager {
  private shortcuts: Shortcut[] = [];
  private isActive: boolean = true;
  
  /**
   * Register a new keyboard shortcut
   * @param shortcut - Shortcut configuration object
   * @returns A function to unregister this shortcut
   */
  registerShortcut(shortcut: Shortcut): () => void {
    this.shortcuts.push(shortcut);
    return () => this.unregisterShortcut(shortcut);
  }
  
  /**
   * Register multiple shortcuts at once
   * @param shortcuts - Array of shortcut configuration objects
   * @returns A function to unregister all these shortcuts
   */
  registerShortcuts(shortcuts: Shortcut[]): () => void {
    shortcuts.forEach(shortcut => this.shortcuts.push(shortcut));
    return () => shortcuts.forEach(shortcut => this.unregisterShortcut(shortcut));
  }
  
  /**
   * Unregister a previously registered shortcut
   * @param shortcutToRemove - The shortcut to remove
   */
  unregisterShortcut(shortcutToRemove: Shortcut): void {
    this.shortcuts = this.shortcuts.filter(shortcut => shortcut !== shortcutToRemove);
  }
  
  /**
   * Enable the shortcut manager
   */
  enable(): void {
    this.isActive = true;
  }
  
  /**
   * Disable the shortcut manager
   */
  disable(): void {
    this.isActive = false;
  }
  
  /**
   * Get all registered shortcuts organized by category
   * @returns Array of shortcut categories
   */
  getShortcutsHelp(): ShortcutCategory[] {
    // Group shortcuts by context
    const contextGroups: Record<string, ShortcutInfo[]> = {};
    
    this.shortcuts.forEach(shortcut => {
      const context = shortcut.context || 'General';
      if (!contextGroups[context]) {
        contextGroups[context] = [];
      }
      
      contextGroups[context].push({
        key: shortcut.key,
        description: shortcut.description,
        context: shortcut.context
      });
    });
    
    // Convert to array of categories
    return Object.entries(contextGroups).map(([title, shortcuts]) => ({
      title,
      shortcuts
    }));
  }
  
  /**
   * Handle a keyboard event and trigger any matching shortcuts
   * @param event - Keyboard event from event listener
   */
  handleKeyEvent(event: KeyboardEvent): void {
    if (!this.isActive) return;
    
    // Skip if typing in an input field and the shortcut doesn't allow it
    const isInputField = 
      event.target instanceof HTMLInputElement || 
      event.target instanceof HTMLTextAreaElement ||
      event.target instanceof HTMLSelectElement;
    
    // Build key string from event
    const key = this.buildKeyString(event);
    
    // Find matching shortcuts
    const matchingShortcuts = this.shortcuts.filter(shortcut => 
      shortcut.key.toLowerCase() === key.toLowerCase() && 
      (shortcut.allowInInputs || !isInputField)
    );
    
    // Execute matching shortcuts
    matchingShortcuts.forEach(shortcut => {
      event.preventDefault();
      shortcut.callback();
    });
  }
  
  /**
   * Convert a keyboard event to a key string
   * @param event - Keyboard event
   * @returns Key string (e.g., 'Shift+G')
   */
  private buildKeyString(event: KeyboardEvent): string {
    const parts: string[] = [];
    
    if (event.ctrlKey) parts.push('Ctrl');
    if (event.altKey) parts.push('Alt');
    if (event.shiftKey) parts.push('Shift');
    if (event.metaKey) parts.push('Meta');
    
    // Special handling for modifier keys when they are pressed alone
    if (event.key === 'Control' || event.key === 'Alt' || 
        event.key === 'Shift' || event.key === 'Meta') {
      // Don't add the key if it's already in the parts array
    } else {
      // Normalize key name
      let key = event.key;
      
      // Handle special keys
      switch (key) {
        case ' ':
          key = 'Space';
          break;
        case 'ArrowUp':
          key = 'Up';
          break;
        case 'ArrowDown':
          key = 'Down';
          break;
        case 'ArrowLeft':
          key = 'Left';
          break;
        case 'ArrowRight':
          key = 'Right';
          break;
        default:
          // Capitalize single letters
          if (key.length === 1) {
            key = key.toUpperCase();
          }
      }
      
      parts.push(key);
    }
    
    return parts.join('+');
  }
}

// Create a singleton instance
const shortcutManager = new KeyboardShortcutManager();

// Set up global event listener
window.addEventListener('keydown', (event) => {
  shortcutManager.handleKeyEvent(event);
});

export default shortcutManager;