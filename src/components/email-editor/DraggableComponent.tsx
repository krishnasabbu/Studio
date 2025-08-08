import React from 'react';
import { useDrag } from 'react-dnd';
import { 
  Type, 
  Image, 
  Mail, 
  FileText, 
  List, 
  ListOrdered, 
  MousePointer, 
  Link, 
  Table, 
  Minus, 
  GitBranch, 
  Phone,
  Users,
  MapPin
} from 'lucide-react';

export interface WidgetType {
  id: string;
  type: 'HeaderWidget' | 'BodyWidget' | 'FooterWidget';
  label: string;
  icon: React.ComponentType<any>;
  category: 'widget';
}

export interface ComponentType {
  id: string;
  type: 'Subject' | 'PageHeader' | 'IllustrationImage' | 'SubHeader' | 'SubHeader2' | 
        'OrderedBullet' | 'UnorderedBullet' | 'CTA' | 'Links' | 'TwoColumnTable' | 
        'DynamicTable' | 'BodyText' | 'Divider' | 'Conditions' | 'PhoneNumber' |
        'FooterText' | 'FooterIcons' | 'ContactDetails';
  label: string;
  icon: React.ComponentType<any>;
  category: 'component';
  allowedWidgets: string[];
  defaultContent: string;
  defaultProperties: any;
}

export const widgetTypes: WidgetType[] = [
  {
    id: 'HeaderWidget',
    type: 'HeaderWidget',
    label: 'Header Widget',
    icon: Image,
    category: 'widget',
  },
  {
    id: 'BodyWidget',
    type: 'BodyWidget',
    label: 'Body Widget',
    icon: FileText,
    category: 'widget',
  },
  {
    id: 'FooterWidget',
    type: 'FooterWidget',
    label: 'Footer Widget',
    icon: Mail,
    category: 'widget',
  },
];

export const componentTypes: ComponentType[] = [
  {
    id: 'Subject',
    type: 'Subject',
    label: 'Subject',
    icon: Mail,
    category: 'component',
    allowedWidgets: ['HeaderWidget'],
    defaultContent: 'Email Subject Line',
    defaultProperties: { fontSize: '16px', fontWeight: 'bold' }
  },
  {
    id: 'PageHeader',
    type: 'PageHeader',
    label: 'Page Header',
    icon: Type,
    category: 'component',
    allowedWidgets: ['HeaderWidget'],
    defaultContent: 'Page Header Title',
    defaultProperties: { fontSize: '24px', fontWeight: 'bold', alignment: 'center' }
  },
  {
    id: 'IllustrationImage',
    type: 'IllustrationImage',
    label: 'Illustration Image',
    icon: Image,
    category: 'component',
    allowedWidgets: ['HeaderWidget'],
    defaultContent: 'https://images.pexels.com/photos/3184291/pexels-photo-3184291.jpeg?auto=compress&cs=tinysrgb&w=400',
    defaultProperties: { width: '100%', alignment: 'center' }
  },
  {
    id: 'SubHeader',
    type: 'SubHeader',
    label: 'Sub Header',
    icon: Type,
    category: 'component',
    allowedWidgets: ['BodyWidget'],
    defaultContent: 'Sub Header Text',
    defaultProperties: { fontSize: '18px', fontWeight: '600' }
  },
  {
    id: 'SubHeader2',
    type: 'SubHeader2',
    label: 'Sub Header 2',
    icon: Type,
    category: 'component',
    allowedWidgets: ['BodyWidget'],
    defaultContent: 'Secondary Sub Header',
    defaultProperties: { fontSize: '16px', fontWeight: '500' }
  },
  {
    id: 'OrderedBullet',
    type: 'OrderedBullet',
    label: 'Ordered Bullet',
    icon: ListOrdered,
    category: 'component',
    allowedWidgets: ['BodyWidget'],
    defaultContent: '1. First item\n2. Second item\n3. Third item',
    defaultProperties: { listStyle: 'decimal' }
  },
  {
    id: 'UnorderedBullet',
    type: 'UnorderedBullet',
    label: 'Unordered Bullet',
    icon: List,
    category: 'component',
    allowedWidgets: ['BodyWidget'],
    defaultContent: '• First item\n• Second item\n• Third item',
    defaultProperties: { listStyle: 'disc' }
  },
  {
    id: 'CTA',
    type: 'CTA',
    label: 'CTA',
    icon: MousePointer,
    category: 'component',
    allowedWidgets: ['BodyWidget'],
    defaultContent: 'Call to Action',
    defaultProperties: { 
      backgroundColor: '#3B82F6', 
      color: '#ffffff', 
      padding: '12px 24px',
      borderRadius: '6px',
      alignment: 'center'
    }
  },
  {
    id: 'Links',
    type: 'Links',
    label: 'Links',
    icon: Link,
    category: 'component',
    allowedWidgets: ['BodyWidget'],
    defaultContent: 'Click here for more information',
    defaultProperties: { color: '#3B82F6', textDecoration: 'underline' }
  },
  {
    id: 'TwoColumnTable',
    type: 'TwoColumnTable',
    label: 'Two Column Table',
    icon: Table,
    category: 'component',
    allowedWidgets: ['BodyWidget'],
    defaultContent: 'Column 1 | Column 2\nRow 1 | Row 1\nRow 2 | Row 2',
    defaultProperties: { borderCollapse: 'collapse', width: '100%' }
  },
  {
    id: 'DynamicTable',
    type: 'DynamicTable',
    label: 'Dynamic Table',
    icon: Table,
    category: 'component',
    allowedWidgets: ['BodyWidget'],
    defaultContent: 'Header 1 | Header 2 | Header 3\nData 1 | Data 2 | Data 3',
    defaultProperties: { borderCollapse: 'collapse', width: '100%' }
  },
  {
    id: 'BodyText',
    type: 'BodyText',
    label: 'Body Text',
    icon: FileText,
    category: 'component',
    allowedWidgets: ['BodyWidget'],
    defaultContent: 'Body text content goes here. This is a paragraph of text that can be customized.',
    defaultProperties: { fontSize: '14px', lineHeight: '1.6' }
  },
  {
    id: 'Divider',
    type: 'Divider',
    label: 'Divider',
    icon: Minus,
    category: 'component',
    allowedWidgets: ['BodyWidget'],
    defaultContent: '',
    defaultProperties: { height: '1px', backgroundColor: '#e5e7eb', margin: '20px 0' }
  },
  {
    id: 'Conditions',
    type: 'Conditions',
    label: 'Conditions',
    icon: GitBranch,
    category: 'component',
    allowedWidgets: ['BodyWidget'],
    defaultContent: 'Conditional content block',
    defaultProperties: { condition: 'if user.premium', display: 'block' }
  },
  {
    id: 'PhoneNumber',
    type: 'PhoneNumber',
    label: 'Phone Number',
    icon: Phone,
    category: 'component',
    allowedWidgets: ['FooterWidget'],
    defaultContent: '+1 (555) 123-4567',
    defaultProperties: { fontSize: '14px', color: '#3B82F6' }
  },
  {
    id: 'FooterText',
    type: 'FooterText',
    label: 'Footer Text',
    icon: FileText,
    category: 'component',
    allowedWidgets: ['FooterWidget'],
    defaultContent: 'Copyright © 2024 Company Name. All rights reserved.',
    defaultProperties: { fontSize: '12px', color: '#6B7280' }
  },
  {
    id: 'FooterIcons',
    type: 'FooterIcons',
    label: 'Footer Icons',
    icon: Users,
    category: 'component',
    allowedWidgets: ['FooterWidget'],
    defaultContent: 'Social Media Icons',
    defaultProperties: { alignment: 'center' }
  },
  {
    id: 'ContactDetails',
    type: 'ContactDetails',
    label: 'Contact Details',
    icon: MapPin,
    category: 'component',
    allowedWidgets: ['FooterWidget'],
    defaultContent: '123 Main St, City, State 12345\ncontact@company.com',
    defaultProperties: { fontSize: '12px', color: '#6B7280' }
  }
];

interface DraggableItemProps {
  item: ComponentType | WidgetType;
}

const DraggableComponent: React.FC<DraggableItemProps> = ({ item }) => {
  const [{ isDragging }, drag] = useDrag(() => ({
    type: item.category,
    item: JSON.parse(JSON.stringify(item)), // Deep copy to avoid reference issues
    collect: (monitor) => ({
      isDragging: monitor.isDragging(),
    }),
  }));

  const IconComponent = item.icon;

  return (
    <div
      ref={drag}
      className={`flex items-center space-x-3 p-3 bg-white dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-lg cursor-move hover:shadow-md transition-all duration-200 ${
        isDragging ? 'opacity-50' : ''
      }`}
    >
      <IconComponent className="h-5 w-5 text-gray-600 dark:text-gray-400" />
      <span className="text-sm font-medium text-gray-900 dark:text-white">
        {item.label}
      </span>
    </div>
  );
};

export default DraggableComponent;