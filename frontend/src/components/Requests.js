import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useState, useRef, useEffect } from 'react';
import './Requests.css';
const Requests = ({ townRequests = [], playerInventory = [], onFulfillRequest }) => {
    // State for the secret coin counter Easter egg
    const [coinClicks, setCoinClicks] = useState(0);
    const [showSecretMessage, setShowSecretMessage] = useState(false);
    const coinCounterRef = useRef(null);
    const secretMessageRef = useRef(null);
    const secretClickTimeoutRef = useRef(null); // Timeout for resetting clicks
    // Function to check if player has enough items to fulfill a request
    const canFulfill = (request) => {
        const totalQuantity = playerInventory
            .filter(item => item.name === request.item)
            .reduce((sum, item) => sum + item.quantity, 0);
        return totalQuantity >= request.quantity;
    };
    // Handle the secret coin click
    const handleCoinClick = (e) => {
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
        coinSound.play().catch(() => { });
        // Update counter element
        if (coinCounterRef.current) {
            coinCounterRef.current.classList.add('show');
            coinCounterRef.current.textContent = `${newClicks}`;
            // Optional: Add a small animation on update
            coinCounterRef.current.style.transform = 'scale(1.2)';
            setTimeout(() => {
                if (coinCounterRef.current)
                    coinCounterRef.current.style.transform = 'scale(1)';
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
            cheatSound.play().catch(() => { });
            setTimeout(() => {
                setShowSecretMessage(false);
            }, 5000); // Message visible for 5 seconds
            setCoinClicks(0); // Reset after cheat triggers
        }
        else {
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
            const handleDOMClick = (e) => {
                const mouseEvent = e;
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
    return (_jsxs("div", { className: "requests-container", children: [_jsx("div", { className: "requests-list-area", children: townRequests.length === 0 ? (_jsx("div", { className: "request-list empty", children: _jsx("p", { children: "No outstanding requests from the townsfolk." }) })) : (_jsx("div", { className: "request-list", children: townRequests.map(request => {
                        const playerCanFulfill = canFulfill(request);
                        const totalQuantity = playerInventory
                            .filter(item => item.name === request.item)
                            .reduce((sum, item) => sum + item.quantity, 0);
                        return (_jsxs("div", { className: "request-item", children: [_jsx("div", { className: "request-icon", title: request.requester, children: request.requester.charAt(0).toUpperCase() }), _jsxs("div", { className: "request-details", children: [_jsxs("div", { className: "request-requester", children: [request.requester, " requests:"] }), _jsxs("div", { className: "request-item-info", children: [_jsxs("strong", { children: [request.quantity, " \u00D7 ", request.item] }), _jsxs("div", { className: "inventory-check", children: ["(Have: ", totalQuantity, ")"] })] }), _jsxs("div", { className: "request-rewards", children: [_jsx("div", { className: "request-reward request-reward-gold", title: `${request.rewardGold} Gold`, children: request.rewardGold }), _jsxs("div", { className: "request-reward request-reward-influence", title: `${request.rewardInfluence} Rep`, children: ["+", request.rewardInfluence] })] })] }), _jsxs("div", { className: "request-info", children: [_jsxs("div", { className: "request-difficulty", title: `Difficulty: ${request.difficulty}/5`, children: [Array(request.difficulty).fill('★').join(''), Array(5 - request.difficulty).fill('☆').join('')] }), _jsx("button", { className: `fulfill-button ${playerCanFulfill ? 'can-fulfill' : 'cant-fulfill'}`, onClick: () => playerCanFulfill && onFulfillRequest(request.id), disabled: !playerCanFulfill, children: playerCanFulfill ? 'Fulfill' : 'Need Items' })] })] }, request.id));
                    }) })) }), _jsx("div", { ref: coinCounterRef, className: "coin-counter" }), _jsx("div", { ref: secretMessageRef, className: `secret-message ${showSecretMessage ? 'reveal' : ''}`, children: "* * ITEM_DUPLICATION_ENABLED * * (Just kidding!)" })] }));
};
export default Requests;
//# sourceMappingURL=Requests.js.map