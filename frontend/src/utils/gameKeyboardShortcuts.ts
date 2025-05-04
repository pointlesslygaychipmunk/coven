/**
 * Game Keyboard Shortcuts
 * 
 * This file defines keyboard shortcuts specific to the game interface.
 * It integrates with the general keyboard shortcuts manager.
 */

import shortcutManager, { Shortcut } from './keyboardShortcuts';

/**
 * Registers all game-related keyboard shortcuts
 * @param callbacks - Object containing callback functions for each shortcut
 * @returns Function to unregister all shortcuts
 */
export const registerGameShortcuts = (callbacks: {
  navigateToGarden: () => void;
  navigateToWorkshop: () => void;
  navigateToMarket: () => void;
  navigateToJournal: () => void;
  toggleMail?: () => void;
  toggleChat?: () => void;
  endDay?: () => void;
  backToLobby?: () => void;
  openHelp?: () => void;
}) => {
  const shortcuts: Shortcut[] = [
    // Navigation shortcuts
    {
      key: 'g',
      callback: callbacks.navigateToGarden,
      description: 'Go to Garden',
      context: 'Navigation',
      allowInInputs: false
    },
    {
      key: 'w',
      callback: callbacks.navigateToWorkshop,
      description: 'Go to Workshop',
      context: 'Navigation',
      allowInInputs: false
    },
    {
      key: 'm',
      callback: callbacks.navigateToMarket,
      description: 'Go to Market',
      context: 'Navigation',
      allowInInputs: false
    },
    {
      key: 'j',
      callback: callbacks.navigateToJournal,
      description: 'Go to Journal',
      context: 'Navigation',
      allowInInputs: false
    },
    
    // Communication shortcuts
    ...(callbacks.toggleMail ? [{
      key: 'Shift+M',
      callback: callbacks.toggleMail,
      description: 'Toggle Mail',
      context: 'Communication',
      allowInInputs: false
    }] : []),
    
    ...(callbacks.toggleChat ? [{
      key: 'Shift+C',
      callback: callbacks.toggleChat,
      description: 'Toggle Chat',
      context: 'Communication',
      allowInInputs: false
    }] : []),
    
    // Game actions
    ...(callbacks.endDay ? [{
      key: 'e',
      callback: callbacks.endDay,
      description: 'End Day',
      context: 'Game Actions',
      allowInInputs: false
    }] : []),
    
    // Global actions
    ...(callbacks.backToLobby ? [{
      key: 'Escape',
      callback: callbacks.backToLobby,
      description: 'Back to Lobby',
      context: 'Global',
      allowInInputs: false
    }] : []),
    
    // Help
    ...(callbacks.openHelp ? [{
      key: '?',
      callback: callbacks.openHelp,
      description: 'Show Keyboard Shortcuts',
      context: 'Help',
      allowInInputs: true
    }] : [])
  ];
  
  // Register all shortcuts
  return shortcutManager.registerShortcuts(shortcuts);
};

/**
 * Creates a KeyboardShortcutsHelp component to display available shortcuts
 * @returns Array of shortcut categories with their shortcuts
 */
export const getGameShortcutsHelp = () => {
  return shortcutManager.getShortcutsHelp();
};

export default registerGameShortcuts;