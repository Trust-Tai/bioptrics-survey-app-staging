import { useEffect, useRef } from 'react';

interface HighlightOptions {
  selectors: string[];
  enabled: boolean;
}

export const useElementHighlighter = ({ selectors, enabled }: HighlightOptions) => {
  const highlightedElementsRef = useRef<HTMLElement[]>([]);
  const originalStylesRef = useRef<Map<HTMLElement, string>>(new Map());

  const highlightStyle = `
    box-shadow: 0 0 0 3px rgba(243, 156, 18, 0.6), 0 0 20px rgba(243, 156, 18, 0.3) !important;
    border-radius: 4px !important;
    transition: all 0.3s ease !important;
    position: relative !important;
    z-index: 1000 !important;
  `;

  const fadeOutStyle = `
    box-shadow: 0 0 0 0px rgba(243, 156, 18, 0), 0 0 0px rgba(243, 156, 18, 0) !important;
    border-radius: 4px !important;
    transition: all 0.3s ease !important;
    position: relative !important;
    z-index: 1000 !important;
  `;

  const clearHighlights = (withFadeOut = true) => {
    if (withFadeOut && highlightedElementsRef.current.length > 0) {
      // First apply fade-out transition
      highlightedElementsRef.current.forEach(element => {
        const originalStyle = originalStylesRef.current.get(element);
        if (originalStyle !== undefined) {
          // Apply fade-out effect first
          element.style.cssText = originalStyle + fadeOutStyle;
        }
      });
      
      // After transition completes, restore original styles
      setTimeout(() => {
        highlightedElementsRef.current.forEach(element => {
          const originalStyle = originalStylesRef.current.get(element);
          if (originalStyle !== undefined) {
            element.style.cssText = originalStyle;
          }
        });
        
        highlightedElementsRef.current = [];
        originalStylesRef.current.clear();
      }, 300); // Match the transition duration
    } else {
      // Immediate clear without fade-out (for switching highlights)
      highlightedElementsRef.current.forEach(element => {
        const originalStyle = originalStylesRef.current.get(element);
        if (originalStyle !== undefined) {
          element.style.cssText = originalStyle;
        }
      });
      
      highlightedElementsRef.current = [];
      originalStylesRef.current.clear();
    }
  };

  const applyHighlights = () => {
    clearHighlights(false); // Clear without fade-out when applying new highlights

    if (!enabled || selectors.length === 0) {
      return;
    }

    let totalElementsFound = 0;

    selectors.forEach(selector => {
      try {
        const elements = document.querySelectorAll(selector) as NodeListOf<HTMLElement>;
        
        // If selector ends with :first-of-type, only take the first element
        const elementsToHighlight = selector.includes(':first-of-type') ? 
          (elements.length > 0 ? [elements[0]] : []) : 
          Array.from(elements);
        
        totalElementsFound += elementsToHighlight.length;
        
        elementsToHighlight.forEach((element, index) => {
          originalStylesRef.current.set(element, element.style.cssText);
          element.style.cssText += highlightStyle;
          highlightedElementsRef.current.push(element);
        });
      } catch (error) {
        console.warn(`Invalid selector: ${selector}`, error);
      }
    });
  };

  useEffect(() => {
    if (enabled) {
      applyHighlights();
      return () => clearHighlights();
    } else {
      clearHighlights();
    }
  }, [selectors, enabled]);

  useEffect(() => {
    return () => clearHighlights();
  }, []);

  return { applyHighlights, clearHighlights };
};
