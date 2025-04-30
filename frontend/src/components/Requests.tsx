import React from 'react';
import './Requests.css'; // Ensure this CSS file exists
import { TownRequest, InventoryItem } from 'coven-shared'; // Use shared types

interface RequestsProps {
  townRequests: TownRequest[];
  playerInventory: InventoryItem[];
  onFulfillRequest: (requestId: string) => void;
}

const Requests: React.FC<RequestsProps> = ({
  townRequests = [], // Default to empty array
  playerInventory = [],
  onFulfillRequest
}) => {

  // Check if player has enough items to fulfill a specific request
  const canFulfill = (request: TownRequest): boolean => {
    // Sum up quantity across all stacks of the required item
    const totalQuantity = playerInventory
      .filter(item => item.name === request.item)
      .reduce((sum, item) => sum + item.quantity, 0);
    return totalQuantity >= request.quantity;
  };

  // Format price (reusable, maybe move to utils)
  // const formatPrice = (price: number): string => `${price} G`;

  return (
    <div className="requests-container">
      <div className="requests-header">
        {/* Using emoji as simple icon */}
        <h2><span className="requests-icon">📜</span> Town Requests</h2>
        {/* Add sorting/filtering options here later if needed */}
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
              // Find *any* stack for quality display (or calculate average if needed)
              const requiredItemInv = playerInventory.find(item => item.name === request.item);
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
                    <div className="request-item-info"> {/* Renamed class */}
                      <strong>{request.quantity} x {request.item}</strong>
                      <div className="inventory-check">
                        (You have: {totalQuantity}
                        {/* Optionally show average quality if relevant */}
                        {/* {requiredItemInv?.quality ? `, Avg Q: ${requiredItemInv.quality}%` : ''} */}
                        )
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
    </div>
  );
};

export default Requests;