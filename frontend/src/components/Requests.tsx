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
  
  // Function to check if player has enough items to fulfill a request
  const canFulfill = (request: TownRequest): boolean => {
    // Sum up quantity across all stacks of the required item
    const totalQuantity = playerInventory
      .filter(item => item.name === request.item)
      .reduce((sum, item) => sum + item.quantity, 0);
    return totalQuantity >= request.quantity;
  };
  
  // Handle the secret coin click
  const handleCoinClick = (e: React.MouseEvent | MouseEvent) => {
    // Use stopPropagation if it's available (it is in React.MouseEvent)
    if ('stopPropagation' in e) {
      e.stopPropagation();
    }
    
    setCoinClicks(prev => prev + 1);
    
    // Play a subtle coin sound
    const coinSound = new Audio('data:audio/wav;base64,UklGRjQFAABXQVZFZm10IBAAAAABAAEARKwAAESsAAABAAgAZGF0YRAFAACBhYqFbF1fZHByb4J2eH6Dg4CJgIOJhIGFgX+DcHR1gHp6gYGAfX13f3+Ca2pubnN1gXR5goCBg4OBhH1+gH9/fYB5dHJydnR4gHp7g4SKjoyMioqIhDU4PURHUVBXXmFpbHF3eoF/g4GFgoJ/hH55e3t9d3+AeXx+fH9/gX+CgIOBhIJ+fX12cG9ucnNydnp7gISHjI+SkZKUlZM/Q0pTVVtgY2ptcHJ1eX6Ag4GEgIGCgH99fnt8eHx+enp7fH1/gYGDhISGhYaEgHt3dXNwcXFydHd6foOGipCTlZaZm5g2O0FKT1VZXmNobG9zdnuAgoWDhYeEgn+AfXx5ent4enp6e359f4GChIaHiIiIhoF9eXZzcnBwcnR2eX2ChoqRlJaYm52aLTI3Pj9HS09TWV1ja3J3fYOHiouNjYyLiIWDgHt9e3l5enl7fH5/gYOFiIqMjIyLiol/e3l2dHJydXd4fICEiIyTlZebnqCdKi81PEBGTFFTWl5jZ25zd36EiIyPkJGQj42Lh4SCf3t6eXh5enx9f4GDhomMj5GSk5OTkId+e3h1dHN0dXd6fYGFio+UmJqdoKOgKi40PEBHSlBTWV5jZ29zd36EiIyPkZKRkI6MiISCf3t6eXh5ent9f4GDhomMj5GSkpOSkoZ9enh1c3N0dnd6fYKFiY+UmJqdoKOgKi40PEBHSlBTWl5jZ29zd36DiIyPkZKRkI6MiISCf3t6eXh5ent9f4GDhomMj5GSkpOSkoZ9enh1c3N0dnd6fYKFiY+UmJqdoKOgLjM4P0RITlNWW19jZ29ydXqAhIiMj5CQj46Lh4SCf3t6eXl5enx+f4KFiYuOkZOUlJSTj4d+e3dzc3J0dXd6fYGFio+UmJqeoaSiNTk+RUlNUlVZXF9jZmpucXR3eoB/hIOHhISDgHx7eXZ3dXZ4eXp8f4KHi46OkJCQjoqGgHp1c3Fvb3Fyd3l9goeLj5aXmZyfoKCgo6ShoJxXXF9fXVxZV1leYGBgYmRnaWxucnZ5fHx/foCAfnx6d3RxbmxrbG5vcXV5fYGFiIuMjY2LiomHhYSCgYB/fXp5eHZ1dnh6fICDhoiLjY+RkpSTkpGPjImGhHt3dnNwbm1tbW5vcXN2eXx+gIKDhIWFhIOCgH59e3p4d3Z2dXV2d3h6fX+BhIaJi42PkZKTk5KRj42KiYaEgn98e3l4d3d4eXt8f4GDhoiKjI6QkpOTkpGPjYqIhYN/e3h1c3FwcHBxcnR2eXt9f4GChIWGhoaFhIKBf317enh3dnZ2d3h6fH5/goSGiYuNj5GSk5OSkY+NioiGhIJ/fHt5eHd3eHl7fH+BhIaIioyOkJKTk5KRj42KiIWDf3t4dXNxcHBwcXJ0dXl7fX+BgoSFhoaGhYSCgX99e3p4d3Z2dnd4enx+f4KDhomLjY+RkpOTkpGOjYqIhYSCf3x7eXh3d3h5e3x/gYOGiIqMjpCSk5OSko+NioiGg4B8eXZzcXBwcHBycnV3eXt+gIKEhYaGhoWEg4F/fXt6eHd2dXZ3eHp8fn+Cg4WIi42PkZKTk5KSj42KiIaEgn98e3l4d3d4eXt8foGDhYiKi46QkZOTkpGPjYqIhYOAfHl2c3FwcHBwcXN1d3l7foCChIWGhoaFhIKBf317enh3dnV2d3h6fH5/goOFiIuNj5GSk5OSkY+NiomGhIJ/fHt5eHd3eHl7fH+Bg4aIioyOkJGTk5KRj42KiIWDgH17eHVzcXBwb3Fyk5OUlZaXmJiYmJeWlZST'); 
    coinSound.volume = 0.2;
    coinSound.play().catch(() => {
      // Audio play failed (probably because user hasn't interacted) - ignore
    });
    
    // Update counter element
    if (coinCounterRef.current) {
      coinCounterRef.current.classList.add('show');
      coinCounterRef.current.textContent = `${coinClicks + 1}`;
      
      // Hide counter after a delay
      setTimeout(() => {
        if (coinCounterRef.current) {
          coinCounterRef.current.classList.remove('show');
        }
      }, 2000);
    }
    
    // Reveal secret message after 7 clicks
    if (coinClicks + 1 >= 7 && secretMessageRef.current) {
      setShowSecretMessage(true);
      setTimeout(() => {
        setShowSecretMessage(false);
      }, 5000);
    }
  };
  
  // Add event listener to the container for the secret coin
  useEffect(() => {
    const container = document.querySelector('.requests-container');
    if (container) {
      // Create a properly typed event handler that accepts the correct Event type
      const handleDOMClick = (e: Event) => {
        // Need to cast the event to MouseEvent to access clientX/clientY
        const mouseEvent = e as MouseEvent;
        
        // Check if click was in the bottom-right corner
        const rect = container.getBoundingClientRect();
        const x = mouseEvent.clientX - rect.left;
        const y = mouseEvent.clientY - rect.top;
        
        if (x > rect.width - 20 && y > rect.height - 20) {
          // Pass the DOM MouseEvent to the handler
          handleCoinClick(mouseEvent);
        }
      };
      
      container.addEventListener('click', handleDOMClick);
      return () => {
        container.removeEventListener('click', handleDOMClick);
      };
    }
    
    // Default return for when no container is found
    return undefined;
  }, [coinClicks]);

  return (
    <div className="requests-container">
      <div className="requests-header">
        {/* Using emoji as simple icon with animation */}
        <h2>
          <span className="requests-icon">📜</span> 
          Town Requests
        </h2>
      </div>

      <div className="requests-list-area">
        {townRequests.length === 0 ? (
          <div className="request-list empty">
            <p>No outstanding requests from the townsfolk.</p>
          </div>
        ) : (
          <div className="request-list">
            {townRequests.map(request => {
              const playerCanFulfill = canFulfill(request);
              // Calculate total quantity for the request
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
                      <strong>{request.quantity} x {request.item}</strong>
                      <div className="inventory-check">
                        (You have: {totalQuantity})
                      </div>
                    </div>
                    <div className="request-rewards">
                      <div className="request-reward request-reward-gold" title={`${request.rewardGold} Gold Reward`}>
                        {request.rewardGold}
                      </div>
                      <div className="request-reward request-reward-influence" title={`${request.rewardInfluence} Reputation Reward`}>
                        +{request.rewardInfluence}
                      </div>
                    </div>
                  </div>
                  <div className="request-info">
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
      <div 
        ref={secretMessageRef} 
        className={`secret-message ${showSecretMessage ? 'reveal' : ''}`}
      >
        * CHEAT CODE ACTIVATED: UNLIMITED HERBS *
      </div>
    </div>
  );
};

export default Requests;