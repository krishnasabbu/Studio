import React, { useEffect, useRef, useState } from 'react';
import mermaid from 'mermaid';
import type { MermaidConfig } from 'mermaid';
import { useAppSelector } from '../../hooks/useRedux';

const MermaidDiagram: React.FC<{ chart: string }> = ({ chart }) => {
  const elementRef = useRef<HTMLDivElement>(null);
  const { isDarkMode } = useAppSelector(state => state.theme);
  const [renderedSVG, setRenderedSVG] = useState('');
  const [isRendering, setIsRendering] = useState(true);

  // Memoize the chart, so it doesn't cause unnecessary re-renders
  const memoizedChart = chart.trim();

  useEffect(() => {
    // If the chart is empty, don't try to render
    if (!memoizedChart) {
      setRenderedSVG('');
      setIsRendering(false);
      return;
    }

    setIsRendering(true);
    setRenderedSVG(''); // Clear previous SVG when a new render starts

    const renderChart = async () => {
      try {
        const themeToUse = isDarkMode ? 'dark' : 'neutral';

        const config: MermaidConfig = {
          startOnLoad: false,
          theme: themeToUse as 'default' | 'dark' | 'neutral' | 'base',
          securityLevel: 'loose',
          fontFamily: 'ui-sans-serif, system-ui, sans-serif',
          fontSize: 16,
          darkMode: isDarkMode,
          flowchart: {
            useMaxWidth: true,
            htmlLabels: true,
            curve: 'basis'
          },
          themeVariables: isDarkMode ? {
            primaryColor: '#4f46e5',
            primaryTextColor: '#ffffff',
            primaryBorderColor: '#6366f1',
            lineColor: '#9ca3af',
            sectionBkgColor: '#374151',
            altSectionBkgColor: '#4b5563',
            gridColor: '#6b7280',
            secondaryColor: '#1f2937',
            tertiaryColor: '#111827'
          } : {
            primaryColor: '#4f46e5',
            primaryTextColor: '#1f2937',
            primaryBorderColor: '#6366f1',
            lineColor: '#374151',
            sectionBkgColor: '#f3f4f6',
            altSectionBkgColor: '#e5e7eb',
            gridColor: '#9ca3af',
            secondaryColor: '#ffffff',
            tertiaryColor: '#f9fafb'
          }
        };

        mermaid.initialize(config);

        const diagramId = `mermaid-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
        const { svg } = await mermaid.render(diagramId, memoizedChart);
        setRenderedSVG(svg);
      } catch (error) {
        console.warn('Mermaid rendering failed:', error);
        setRenderedSVG(`
          <div class="text-sm text-gray-500 dark:text-gray-400 italic p-4 text-center">
            Diagram could not be rendered
          </div>
        `);
      } finally {
        setIsRendering(false);
      }
    };
    
    renderChart();
    
  }, [memoizedChart, isDarkMode]);
  
  return (
    <div 
      className="my-4 flex justify-center overflow-x-auto bg-white dark:bg-[#212121] rounded-lg p-4 border border-gray-200 dark:border-gray-600"
      style={{ minHeight: '150px' }}
    >
      {isRendering ? (
        <div className="text-gray-500 dark:text-gray-400 flex items-center justify-center w-full">Loading diagram...</div>
      ) : (
        <div 
          dangerouslySetInnerHTML={{ __html: renderedSVG }} 
        />
      )}
    </div>
  );
};

export default MermaidDiagram;