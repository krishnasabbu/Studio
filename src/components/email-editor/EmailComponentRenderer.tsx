import React from 'react';
import { EmailComponent } from '../../store/slices/emailEditorSlice';

interface EmailComponentRendererProps {
  component: EmailComponent;
  isViewing?: boolean;
}

const EmailComponentRenderer: React.FC<EmailComponentRendererProps> = ({ component, isViewing = false }) => {
  const renderComponent = () => {
    const style = {
      color: component.properties.color,
      fontSize: component.properties.fontSize,
      fontWeight: component.properties.fontWeight,
      textAlign: component.properties.alignment as any,
      backgroundColor: component.properties.backgroundColor,
      padding: component.properties.padding,
      borderRadius: component.properties.borderRadius,
      margin: component.properties.margin,
      width: component.properties.width,
      height: component.properties.height,
      borderColor: component.properties.borderColor,
      textDecoration: component.properties.textDecoration,
      lineHeight: component.properties.lineHeight,
    };

    switch (component.type) {
      case 'Subject':
        return (
          <div className={`p-3 bg-gray-100 dark:bg-gray-700 rounded ${isViewing ? 'opacity-90' : ''}`}>
            <span className="text-xs text-gray-500 dark:text-gray-400">Subject:</span>
            <div dangerouslySetInnerHTML={{ __html: component.content }}>
            </div>
          </div>
        );

      case 'PageHeader':
        return (
          <h1 style={style} className={`text-2xl font-bold ${isViewing ? 'opacity-90' : ''}`}>
            {component.content}
          </h1>
        );

      case 'IllustrationImage':
        return (
          <div style={{ textAlign: component.properties.alignment }} className={`py-4 ${isViewing ? 'opacity-90' : ''}`}>
            <img
              src={component.content}
              alt="Illustration"
              style={{ width: component.properties.width, maxWidth: '100%' }}
              className="rounded-lg"
            />
          </div>
        );

      case 'SubHeader':
        return (
          <h2 style={style} className={`text-lg font-semibold ${isViewing ? 'opacity-90' : ''}`}>
            {component.content}
          </h2>
        );

      case 'SubHeader2':
        return (
          <h3 style={style} className={`text-base font-medium ${isViewing ? 'opacity-90' : ''}`}>
            {component.content}
          </h3>
        );

      case 'OrderedBullet':
        return (
          <ol style={style} className={`list-decimal list-inside space-y-1 ${isViewing ? 'opacity-90' : ''}`}>
            {component.content.split('\n').map((item, index) => (
              <li key={index}>{item.replace(/^\d+\.\s*/, '')}</li>
            ))}
          </ol>
        );

      case 'UnorderedBullet':
        return (
          <ul style={style} className={`list-disc list-inside space-y-1 ${isViewing ? 'opacity-90' : ''}`}>
            {component.content.split('\n').map((item, index) => (
              <li key={index}>{item.replace(/^•\s*/, '')}</li>
            ))}
          </ul>
        );

      case 'CTA':
        return (
          <div style={{ textAlign: component.properties.alignment }} className={`py-2 ${isViewing ? 'opacity-90' : ''}`}>
            <button
              style={style}
              className={`inline-block px-6 py-3 rounded-lg font-medium transition-opacity ${
                isViewing ? 'cursor-default' : 'hover:opacity-90'
              }`}
              disabled={isViewing}
            >
              {component.content}
            </button>
          </div>
        );

      case 'Links':
        return (
          <a 
            href={isViewing ? undefined : "#"} 
            style={style} 
            className={`transition-opacity ${isViewing ? 'cursor-default opacity-90' : 'hover:opacity-80'}`}
            onClick={isViewing ? (e) => e.preventDefault() : undefined}
          >
            {component.content}
          </a>
        );

      case 'TwoColumnTable':
      case 'DynamicTable':
        return (
          <table style={style} className={`border border-gray-300 dark:border-gray-600 ${isViewing ? 'opacity-90' : ''}`}>
            <tbody>
              {component.content.split('\n').map((row, index) => {
                const cells = row.split('|').map(cell => cell.trim());
                return (
                  <tr key={index} className={index === 0 ? 'bg-gray-100 dark:bg-gray-700' : ''}>
                    {cells.map((cell, cellIndex) => (
                      <td
                        key={cellIndex}
                        className="border border-gray-300 dark:border-gray-600 px-3 py-2"
                      >
                        {cell}
                      </td>
                    ))}
                  </tr>
                );
              })}
            </tbody>
          </table>
        );

      case 'BodyText':
        return (
          <p style={style} className={isViewing ? 'opacity-90' : ''}>
            {component.content}
          </p>
        );

      case 'Divider':
        return (
          <hr
            style={{
              ...style,
              border: 'none',
              borderTop: `${component.properties.height || '1px'} solid ${component.properties.backgroundColor || '#e5e7eb'}`,
              opacity: isViewing ? 0.9 : 1,
            }}
          />
        );

      case 'Conditions':
        return (
          <div className={`p-3 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-700 rounded ${isViewing ? 'opacity-90' : ''}`}>
            <div className="text-xs text-yellow-600 dark:text-yellow-400 mb-1">
              Conditional Block: {component.properties.condition}
            </div>
            <div style={style}>{component.content}</div>
          </div>
        );

      case 'PhoneNumber':
        return (
          <a 
            href={isViewing ? undefined : `tel:${component.content}`} 
            style={style} 
            className={`transition-opacity ${isViewing ? 'cursor-default opacity-90' : 'hover:opacity-80'}`}
            onClick={isViewing ? (e) => e.preventDefault() : undefined}
          >
            {component.content}
          </a>
        );

      case 'FooterText':
        return (
          <p style={style} className={`text-sm ${isViewing ? 'opacity-90' : ''}`}>
            {component.content}
          </p>
        );

      case 'FooterIcons':
        return (
          <div style={{ textAlign: component.properties.alignment }} className={`py-2 ${isViewing ? 'opacity-90' : ''}`}>
            <div className="flex justify-center space-x-4">
              <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center">
                <span className="text-white text-xs">f</span>
              </div>
              <div className="w-8 h-8 bg-blue-400 rounded-full flex items-center justify-center">
                <span className="text-white text-xs">t</span>
              </div>
              <div className="w-8 h-8 bg-pink-500 rounded-full flex items-center justify-center">
                <span className="text-white text-xs">i</span>
              </div>
            </div>
          </div>
        );

      case 'ContactDetails':
        return (
          <div style={style} className={`text-sm ${isViewing ? 'opacity-90' : ''}`}>
            {component.content.split('\n').map((line, index) => (
              <div key={index}>{line}</div>
            ))}
          </div>
        );

      default:
        return (
          <div style={style} className={`p-3 border border-gray-300 dark:border-gray-600 rounded ${isViewing ? 'opacity-90' : ''}`}>
            {component.content}
          </div>
        );
    }
  };

  return (
    <div className={`p-2 border border-transparent rounded transition-colors ${
      isViewing ? '' : 'hover:border-gray-300 dark:hover:border-gray-600'
    }`}>
      {renderComponent()}
    </div>
  );
};

export default EmailComponentRenderer;