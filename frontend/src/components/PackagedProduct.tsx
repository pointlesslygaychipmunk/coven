import React from 'react';
import './PackagedProduct.css';
import { 
  PackagingDesign, 
  Product 
} from 'coven-shared';

interface PackagedProductProps {
  product: Product;
  packaging: PackagingDesign;
  onClick?: () => void;
  className?: string;
  showDetails?: boolean;
  size?: 'small' | 'medium' | 'large';
}

const PackagedProduct: React.FC<PackagedProductProps> = ({
  product,
  packaging,
  onClick,
  className = '',
  showDetails = false,
  size = 'medium'
}) => {
  // Calculate the value modifier based on packaging quality
  const getValueModifier = () => {
    const qualityScore = packaging.qualityScore;
    if (qualityScore < 20) return '0%';
    if (qualityScore < 40) return '+10%';
    if (qualityScore < 60) return '+25%';
    if (qualityScore < 80) return '+50%';
    return '+100%';
  };
  
  // Calculate style for the package container based on design's colors
  const packageStyle = {
    backgroundColor: packaging.colors.base,
    borderColor: packaging.colors.accent,
    color: packaging.colors.accent
  };
  
  // Get quality level text
  const getQualityText = () => {
    const qualityScore = packaging.qualityScore;
    if (qualityScore < 20) return 'Basic';
    if (qualityScore < 40) return 'Standard';
    if (qualityScore < 60) return 'Quality';
    if (qualityScore < 80) return 'Premium';
    return 'Masterpiece';
  };
  
  // Get rarity class based on quality
  const getRarityClass = () => {
    const qualityScore = packaging.qualityScore;
    if (qualityScore < 20) return 'basic';
    if (qualityScore < 40) return 'standard';
    if (qualityScore < 60) return 'quality';
    if (qualityScore < 80) return 'premium';
    return 'masterpiece';
  };
  
  // Get a formatted special effect description
  const getSpecialEffectDescription = () => {
    if (!packaging.specialEffect) return null;
    if (packaging.specialEffects && packaging.specialEffects.length > 0) {
      return `${packaging.specialEffect.name} (${packaging.specialEffects.length > 1 ? 
        `+${packaging.specialEffects.length - 1} more` : 
        ''})`; 
    }
    return packaging.specialEffect.name;
  };
  
  // Calculate value boost percentage
  const getValueBoostPercentage = () => {
    if (!product.enhancedValue) return getValueModifier();
    const percentage = Math.round((product.enhancedValue / product.value) * 100 - 100);
    return `+${percentage}%`;
  };

  return (
    <div 
      className={`packaged-product ${className} ${size} ${getRarityClass()}`}
      onClick={onClick}
    >
      <div 
        className="package-container"
        style={packageStyle}
      >
        <div className="package-content">
          <div className="product-icon">{product.icon}</div>
          <div className="packaging-elements">
            {packaging.material && (
              <div className="material-element">{packaging.material.icon}</div>
            )}
            {packaging.designStyle && (
              <div className="design-element">{packaging.designStyle.icon}</div>
            )}
            {packaging.specialEffect && (
              <div className="effect-element">{packaging.specialEffect.icon}</div>
            )}
          </div>
          {packaging.brand && (
            <div className="brand-element">{packaging.brand.icon}</div>
          )}
          {packaging.packagingType && (
            <div className="package-type" title={`${packaging.packagingType.charAt(0).toUpperCase() + packaging.packagingType.slice(1)}`}>
              {packaging.packagingType === 'bottle' ? '🍶' :
               packaging.packagingType === 'jar' ? '🏺' :
               packaging.packagingType === 'pouch' ? '👝' :
               packaging.packagingType === 'box' ? '📦' :
               packaging.packagingType === 'tin' ? '🥫' :
               packaging.packagingType === 'vial' ? '🧪' : '📦'}
            </div>
          )}
        </div>
        
        <div className="product-name">{product.name}</div>
        
        {packaging.name && (
          <div className="packaging-name">{packaging.name}</div>
        )}
      </div>
      
      {showDetails && (
        <div className="product-details">
          <div className="detail-row">
            <span className="detail-label">Quality:</span>
            <span className={`detail-value quality-${getRarityClass()}`}>
              {getQualityText()}
            </span>
          </div>
          
          <div className="detail-row">
            <span className="detail-label">Value:</span>
            <span className="detail-value value-modifier positive">
              {product.enhancedValue ? getValueBoostPercentage() : getValueModifier()}
            </span>
          </div>
          
          {product.potencyBoost && (
            <div className="detail-row">
              <span className="detail-label">Potency:</span>
              <span className="detail-value positive">
                +{product.potencyBoost}
              </span>
            </div>
          )}
          
          {packaging.specialEffect && (
            <div className="detail-row">
              <span className="detail-label">Effect:</span>
              <span className="detail-value">
                {getSpecialEffectDescription()}
              </span>
            </div>
          )}
          
          {packaging.brand && (
            <div className="detail-row">
              <span className="detail-label">Brand:</span>
              <span className="detail-value">
                {packaging.brand.name}
              </span>
            </div>
          )}
          
          {packaging.material && (
            <div className="detail-row">
              <span className="detail-label">Material:</span>
              <span className="detail-value">
                {packaging.material.name}
              </span>
            </div>
          )}
          
          {product.shelfLife && (
            <div className="detail-row">
              <span className="detail-label">Shelf Life:</span>
              <span className="detail-value positive">
                +{Math.round(product.shelfLife)} days
              </span>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default PackagedProduct;