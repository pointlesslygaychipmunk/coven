import React, { useState, useEffect } from 'react';
import './Rulebook.css';

// Define sections for the rulebook tabs
const SECTIONS = {
  INTRO: 'Introduction',
  GETTING_STARTED: 'Getting Started',
  CORE_MECHANICS: 'Core Mechanics',
  ADVANCED_SYSTEMS: 'Advanced Systems',
  TIPS: 'Tips for Success',
  GLOSSARY: 'Glossary'
};

interface RulebookProps {
  isOpen: boolean;
  onClose: () => void;
}

const Rulebook: React.FC<RulebookProps> = ({ isOpen, onClose }) => {
  const [markdownContent, setMarkdownContent] = useState<string>('');
  const [activeSection, setActiveSection] = useState<string>(SECTIONS.INTRO);
  const [sectionContent, setSectionContent] = useState<{ [key: string]: string }>({});

  // Fetch the rulebook markdown file
  useEffect(() => {
    const fetchRulebook = async () => {
      try {
        const response = await fetch('/rulebook.md');
        const content = await response.text();
        setMarkdownContent(content);
        
        // Parse sections
        parseSections(content);
      } catch (error) {
        console.error('Failed to load rulebook:', error);
      }
    };

    fetchRulebook();
  }, []);

  // Parse the markdown content into sections
  const parseSections = (content: string) => {
    const sections: { [key: string]: string } = {};
    
    // Split by H2 headers (## Title)
    const regex = /^## (.*$)/gm;
    const sectionTitles = content.match(regex)?.map(match => match.replace('## ', '')) || [];
    
    let currentContent = content;
    sectionTitles.forEach((title, index) => {
      const startMarker = `## ${title}`;
      const startIndex = currentContent.indexOf(startMarker);
      
      if (startIndex !== -1) {
        const nextTitle = index < sectionTitles.length - 1 ? `## ${sectionTitles[index + 1]}` : null;
        const endIndex = nextTitle ? currentContent.indexOf(nextTitle, startIndex) : currentContent.length;
        
        let sectionContent = currentContent.substring(startIndex, endIndex);
        
        // Determine which section this title belongs to
        let sectionKey = '';
        if (title.includes('Introduction')) sectionKey = SECTIONS.INTRO;
        else if (title.includes('Getting Started')) sectionKey = SECTIONS.GETTING_STARTED;
        else if (title.includes('Core Mechanics') || title.includes('Lunar') || 
                title.includes('Garden') || title.includes('Brewing') || 
                title.includes('Market')) sectionKey = SECTIONS.CORE_MECHANICS;
        else if (title.includes('Advanced') || title.includes('Atelier') || 
                title.includes('Ritual') || title.includes('Packaging') || 
                title.includes('Multiplayer')) sectionKey = SECTIONS.ADVANCED_SYSTEMS;
        else if (title.includes('Tips')) sectionKey = SECTIONS.TIPS;
        else if (title.includes('Glossary')) sectionKey = SECTIONS.GLOSSARY;
        
        // Append content to section
        if (sectionKey) {
          if (!sections[sectionKey]) {
            sections[sectionKey] = `# ${sectionKey}\n\n`;
          }
          sections[sectionKey] += sectionContent;
        }
      }
    });
    
    // Handle introduction differently since it's the first section
    const introEndIndex = content.indexOf('## ');
    if (introEndIndex !== -1) {
      const introContent = content.substring(0, introEndIndex).trim();
      sections[SECTIONS.INTRO] = introContent;
    }
    
    setSectionContent(sections);
  };

  // If the modal is not open, don't render
  if (!isOpen) return null;

  return (
    <div className="rulebook-modal-overlay" onClick={onClose}>
      <div className="rulebook-modal" onClick={e => e.stopPropagation()}>
        <div className="rulebook-header">
          <h2 className="rulebook-title">New Coven Rulebook</h2>
          <button className="rulebook-close" onClick={onClose}>×</button>
        </div>
        
        <div className="rulebook-tabs">
          {Object.values(SECTIONS).map(section => (
            <button
              key={section}
              className={`rulebook-tab ${activeSection === section ? 'active' : ''}`}
              onClick={() => setActiveSection(section)}
            >
              {section}
            </button>
          ))}
        </div>
        
        <div className="rulebook-content">
          {sectionContent[activeSection] ? (
            <div className="markdown-content">
              {sectionContent[activeSection].split('\n').map((line, index) => {
                // Simple markdown rendering for headers and paragraphs
                if (line.startsWith('# ')) {
                  return <h1 key={index}>{line.replace('# ', '')}</h1>;
                } else if (line.startsWith('## ')) {
                  return <h2 key={index}>{line.replace('## ', '')}</h2>;
                } else if (line.startsWith('### ')) {
                  return <h3 key={index}>{line.replace('### ', '')}</h3>;
                } else if (line.startsWith('- ')) {
                  return <li key={index}>{line.replace('- ', '')}</li>;
                } else if (line.trim() === '') {
                  return <br key={index} />;
                } else {
                  return <p key={index}>{line}</p>;
                }
              })}
            </div>
          ) : (
            <div className="loading-text">Loading rulebook content...</div>
          )}
        </div>
      </div>
    </div>
  );
};

// Helper button component to open the rulebook
export const RulebookButton: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  
  return (
    <>
      <button 
        className="rulebook-button" 
        onClick={() => setIsOpen(true)}
        aria-label="Open game rulebook"
      >
        ?
      </button>
      
      <Rulebook isOpen={isOpen} onClose={() => setIsOpen(false)} />
    </>
  );
};

export default Rulebook;