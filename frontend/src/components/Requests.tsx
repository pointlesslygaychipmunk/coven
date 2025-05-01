import React, { useState, useRef, useEffect } from 'react';
import './Requests.css';
import { TownRequest, InventoryItem } from 'coven-shared';

interface RequestsProps {
  townRequests: TownRequest[];
  playerInventory: InventoryItem[];
  onFulfillRequest: (requestId: string) => void;
}

const Requests: React.FC<RequestsProps> = ({
  townRequests = [],
  playerInventory = [],
  onFulfillRequest
}) => {
  // State for the secret coin counter Easter egg
  const [coinClicks, setCoinClicks] = useState(0);
  const [showSecretMessage, setShowSecretMessage] = useState(false);
  const coinCounterRef = useRef<HTMLDivElement>(null);
  const secretMessageRef = useRef<HTMLDivElement>(null);
  const secretClickTimeoutRef = useRef<NodeJS.Timeout | null>(null); // Timeout for resetting clicks

  // Function to check if player has enough items to fulfill a request
  const canFulfill = (request: TownRequest): boolean => {
    const totalQuantity = playerInventory
      .filter(item => item.name === request.item)
      .reduce((sum, item) => sum + item.quantity, 0);
    return totalQuantity >= request.quantity;
  };

  // Handle the secret coin click
  const handleCoinClick = (e: React.MouseEvent | MouseEvent) => {
    // Use stopPropagation if it's available (it is in React.MouseEvent)
    if (e && 'stopPropagation' in e) {
      e.stopPropagation();
    }

    // Reset the inactivity timeout
     if (secretClickTimeoutRef.current) {
       clearTimeout(secretClickTimeoutRef.current);
     }

    const newClicks = coinClicks + 1;
    setCoinClicks(newClicks);

    // Play a subtle coin sound (placeholder)
     const coinSound = new Audio('data:audio/wav;base64,UklGRkIAAABXQVZFZm10IBAAAAABAAEARKwAAESsAAABAAgAZGF0YQgAAACAgIA='); // Simple click sound
     coinSound.volume = 0.1;
     coinSound.play().catch(() => {});

    // Update counter element
    if (coinCounterRef.current) {
      coinCounterRef.current.classList.add('show');
      coinCounterRef.current.textContent = `${newClicks}`;
      // Optional: Add a small animation on update
      coinCounterRef.current.style.transform = 'scale(1.2)';
      setTimeout(() => {
          if(coinCounterRef.current) coinCounterRef.current.style.transform = 'scale(1)';
      }, 100);

      // Hide counter after a delay (keep it visible briefly)
      setTimeout(() => {
        if (coinCounterRef.current) {
          coinCounterRef.current.classList.remove('show');
        }
      }, 1500);
    }

    // Reveal secret message after 7 clicks
    if (newClicks >= 7 && secretMessageRef.current) {
      setShowSecretMessage(true);
      // Play a different sound for cheat activation
       const cheatSound = new Audio('data:audio/wav;base64,UklGRlIAAABXQVZFZm10IBAAAAABAAEARKwAAESsAAABAAgAZGF0YUgAAAD8/v7+/v7+/v7+/v7+/v7+AgICAgICAgICAgICAgICAgICAgICAAAAAP7+/v7+/v7+/v7+/v7+/v4CAgICAgICAgICAgICAgICAgIAAAD+/v7+/v7+/v7+/v7+/v7+AgICAgICAgICAgICAgICA'); // Simple chime
       cheatSound.volume = 0.2;
       cheatSound.play().catch(()=>{});
      setTimeout(() => {
        setShowSecretMessage(false);
      }, 5000); // Message visible for 5 seconds
      setCoinClicks(0); // Reset after cheat triggers
    } else {
       // Set timeout to reset clicks if not clicked again quickly
       secretClickTimeoutRef.current = setTimeout(() => {
           setCoinClicks(0);
       }, 1200); // Reset after 1.2 seconds
    }
  };

  // Add event listener to the container for the secret coin click area
  useEffect(() => {
    // Target the list area for clicks, assuming it fills the container space
    const container = document.querySelector('.requests-list-area'); // Use a more specific selector if needed

    if (container) {
      const handleDOMClick = (e: Event) => {
        const mouseEvent = e as MouseEvent;
        const rect = container.getBoundingClientRect();
        const x = mouseEvent.clientX - rect.left;
        const y = mouseEvent.clientY - rect.top;

        // Check if click was in the bottom-right corner (adjust size as needed)
        if (x > rect.width - 25 && y > rect.height - 25) {
          handleCoinClick(mouseEvent);
        }
      };

      container.addEventListener('click', handleDOMClick);
      return () => {
        container.removeEventListener('click', handleDOMClick);
        // Clear timeout on unmount
        if (secretClickTimeoutRef.current) {
            clearTimeout(secretClickTimeoutRef.current);
        }
      };
    }
     // Add explicit return for cases where container is not found
     return undefined;
  }, [coinClicks]); // Re-bind listener if coinClicks changes (needed for timeout logic)


  return (
    <div className="requests-container">
      {/* Optional Header - if needed */}
      {/* <div className="requests-header">
        <h2><span className="requests-icon">📜</span> Town Requests</h2>
      </div> */}

      <div className="requests-list-area">
        {townRequests.length === 0 ? (
          <div className="request-list empty">
            <p>No outstanding requests from the townsfolk.</p>
          </div>
        ) : (
          <div className="request-list">
            {townRequests.map(request => {
              const playerCanFulfill = canFulfill(request);
              const totalQuantity = playerInventory
                .filter(item => item.name === request.item)
                .reduce((sum, item) => sum + item.quantity, 0);

              return (
                <div key={request.id} className="request-item">
                  <div className="request-icon" title={request.requester}>
                    {request.requester.charAt(0).toUpperCase()}
                  </div>
                  <div className="request-details">
                    <div className="request-requester">{request.requester} requests:</div>
                    <div className="request-item-info">
                      <strong>{request.quantity} × {request.item}</strong>
                      <div className="inventory-check">(Have: {totalQuantity})</div>
                    </div>
                    <div className="request-rewards">
                      <div className="request-reward request-reward-gold" title={`${request.rewardGold} Gold`}>{request.rewardGold}</div>
                      <div className="request-reward request-reward-influence" title={`${request.rewardInfluence} Rep`}>+{request.rewardInfluence}</div>
                    </div>
                  </div>
                  <div className="request-info">
                     {/* Difficulty on the right side */}
                    <div className="request-difficulty" title={`Difficulty: ${request.difficulty}/5`}>
                      {Array(request.difficulty).fill('★').join('')}
                      {Array(5 - request.difficulty).fill('☆').join('')}
                    </div>
                    <button
                      className={`fulfill-button ${playerCanFulfill ? 'can-fulfill' : 'cant-fulfill'}`}
                      onClick={() => playerCanFulfill && onFulfillRequest(request.id)}
                      disabled={!playerCanFulfill}
                    >
                      {playerCanFulfill ? 'Fulfill' : 'Need Items'}
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Hidden elements for the secret Easter egg */}
      <div ref={coinCounterRef} className="coin-counter"></div>
      <div ref={secretMessageRef} className={`secret-message ${showSecretMessage ? 'reveal' : ''}`}>
         {/* Classic 90s Cheat Message */}
        * * ITEM_DUPLICATION_ENABLED * * (Just kidding!)
      </div>
    </div>
  );
};

export default Requests;