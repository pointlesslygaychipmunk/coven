import React from 'react';
import './Requests.css'; // Ensure this CSS file exists and uses new styles
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

  // Check if player has enough items to fulfill a specific request
  const canFulfill = (request: TownRequest): boolean => {
    const totalQuantity = playerInventory
      .filter(item => item.name === request.item) // Match by name (or baseId if more appropriate)
      .reduce((sum, item) => sum + item.quantity, 0);
    return totalQuantity >= request.quantity;
  };

  return (
    <div className="requests-container">
      {/* Header is typically part of the parent component (Market) */}
      {/* <div className="requests-header"> ... </div> */}

      <div className="requests-list-area">
        {townRequests.length === 0 ? (
          <div className="request-list empty">
            <p>No outstanding requests from the townsfolk.</p>
            {/* Maybe add a flavor image/icon here */}
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
                    {/* Simple initial instead of complex avatar */}
                    {request.requester.charAt(0).toUpperCase()}
                  </div>
                  <div className="request-details">
                    <div className="request-requester">{request.requester} needs help:</div>
                    {/* Description can be added here if available */}
                    {/* <p className="request-description">{request.description || "Needs some items..."}</p> */}
                    <div className="request-item-info">
                      <strong>{request.quantity} x {request.item}</strong>
                      <span className="inventory-check">
                        (Have: {totalQuantity})
                      </span>
                    </div>
                    <div className="request-rewards">
                      <div className="request-reward request-reward-gold" title={`${request.rewardGold} Gold`}>
                         {request.rewardGold}
                      </div>
                      <div className="request-reward request-reward-influence" title={`+${request.rewardInfluence} Reputation`}>
                         +{request.rewardInfluence}
                      </div>
                    </div>
                    {/* Moved difficulty and button together */}
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