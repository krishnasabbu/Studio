import React, { useMemo, useState, useRef, useEffect } from 'react';
import ReactQuill from 'react-quill';
import { Braces, Code2, ChevronDown, X, Search } from 'lucide-react';
import 'react-quill/dist/quill.snow.css';

type ContentEditorProps = {
  value: string;
  onChange: (html: string) => void;
  className?: string;
  placeholder?: string;
  variables?: string[];
  conditions?: string[];
};

type PopupProps = {
  isOpen: boolean;
  onClose: () => void;
  options: string[];
  onSelect: (value: string) => void;
  icon: React.ReactNode;
  title: string;
  color: 'blue' | 'purple';
};

function Popup({ isOpen, onClose, options, onSelect, icon, title, color }: PopupProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const searchInputRef = useRef<HTMLInputElement>(null);

  const filteredOptions = options.filter(option =>
    option.toLowerCase().includes(searchTerm.toLowerCase())
  );

  useEffect(() => {
    if (isOpen && searchInputRef.current) {
      searchInputRef.current.focus();
    }
    if (!isOpen) {
      setSearchTerm('');
    }
  }, [isOpen]);

  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    document.addEventListener('keydown', handleEscape);
    return () => document.removeEventListener('keydown', handleEscape);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const colorClasses = {
    blue: {
      header: 'bg-gradient-to-r from-blue-500 to-blue-600',
      badge: 'bg-blue-100 text-blue-700 border-blue-200',
      option: 'hover:bg-blue-50 border-blue-100',
      search: 'border-blue-200 focus:border-blue-400 focus:ring-blue-100'
    },
    purple: {
      header: 'bg-gradient-to-r from-purple-500 to-purple-600',
      badge: 'bg-purple-100 text-purple-700 border-purple-200',
      option: 'hover:bg-purple-50 border-purple-100',
      search: 'border-purple-200 focus:border-purple-400 focus:ring-purple-100'
    }
  };

  const colors = colorClasses[color];

  return (
    <>
      <div className="fixed inset-0 bg-black bg-opacity-50 z-[9998]" onClick={onClose} />
      <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md max-h-[80vh] overflow-hidden transform transition-all duration-200 scale-100">
          <div className={`${colors.header} text-white p-6 relative`}>
            <button
              onClick={onClose}
              className="absolute top-4 right-4 text-white hover:bg-white hover:bg-opacity-20 rounded-full p-2 transition-colors duration-200"
              aria-label="Close"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex items-center gap-3 mb-4">
              <div className="p-2 bg-white bg-opacity-20 rounded-lg">
                {icon}
              </div>
              <div>
                <h2 className="text-xl font-bold">{title}</h2>
                <p className="text-white text-opacity-90 text-sm">
                  Click any item to insert into editor
                </p>
              </div>
            </div>

            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-white text-opacity-70 w-4 h-4" />
              <input
                ref={searchInputRef}
                type="text"
                placeholder="Search..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 bg-white bg-opacity-20 border border-white border-opacity-30 rounded-lg text-white placeholder-white placeholder-opacity-70 focus:outline-none focus:bg-opacity-30 transition-all duration-200"
              />
            </div>
          </div>

          <div className="p-4">
            <div className="flex items-center justify-between mb-4">
              <span className={`px-3 py-1 rounded-full text-sm font-medium border ${colors.badge}`}>
                {filteredOptions.length} of {options.length} items
              </span>
              {searchTerm && (
                <button
                  onClick={() => setSearchTerm('')}
                  className="text-gray-500 hover:text-gray-700 text-sm"
                >
                  Clear search
                </button>
              )}
            </div>

            <div className="max-h-80 overflow-y-auto space-y-2">
              {filteredOptions.length > 0 ? (
                filteredOptions.map((option, index) => (
                  <button
                    key={index}
                    onClick={() => {
                      onSelect(option);
                      onClose();
                    }}
                    className={`
                      w-full text-left p-4 rounded-xl border-2 transition-all duration-200 
                      ${colors.option} border-gray-100 hover:border-opacity-50 hover:shadow-md
                      focus:outline-none focus:ring-2 focus:ring-opacity-50
                    `}
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-mono text-sm font-medium text-gray-800">
                        {option}
                      </span>
                      <span className="text-xs text-gray-500 opacity-0 group-hover:opacity-100 transition-opacity">
                        Click to insert
                      </span>
                    </div>
                  </button>
                ))
              ) : (
                <div className="text-center py-12">
                  <div className="text-gray-400 mb-3">
                    <Search className="w-12 h-12 mx-auto opacity-50" />
                  </div>
                  <div className="text-gray-500">
                    <div className="font-medium">No items found</div>
                    <div className="text-sm">Try adjusting your search</div>
                  </div>
                </div>
              )}
            </div>
          </div>

          <div className="border-t bg-gray-50 px-6 py-4">
            <div className="flex items-center justify-between text-sm text-gray-600">
              <span>Press ESC to close</span>
              <span className="flex items-center gap-2">
                {icon}
                <span className="font-medium">{title}</span>
              </span>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

function Toolbar({ 
  variables = [], 
  conditions = [],
  onVariableSelect,
  onConditionSelect
}: { 
  variables?: string[];
  conditions?: string[];
  onVariableSelect: (variable: string) => void;
  onConditionSelect: (condition: string) => void;
}) {
  const [variablePopupOpen, setVariablePopupOpen] = useState(false);
  const [conditionPopupOpen, setConditionPopupOpen] = useState(false);

  return (
    <>
      <div
        id="content-editor-toolbar"
        className="flex items-center gap-2 p-3 border-b bg-gray-50 rounded-t-lg"
      >
        <div className="flex items-center gap-1">
          <button className="ql-bold" aria-label="Bold" />
          <button className="ql-italic" aria-label="Italic" />
          <button className="ql-underline" aria-label="Underline" />
        </div>

        <div className="w-px h-6 bg-gray-300" />

        <div className="flex items-center gap-1">
          <button className="ql-script" value="super" aria-label="Superscript" />
          <button className="ql-script" value="sub" aria-label="Subscript" />
        </div>

        <div className="w-px h-6 bg-gray-300" />

        <div className="flex items-center gap-1">
          <button className="ql-link" aria-label="Link" />
        </div>

        <div className="w-px h-6 bg-gray-300" />

        <div className="flex items-center gap-1">
          <button className="ql-list" value="ordered" aria-label="Numbered list" />
          <button className="ql-list" value="bullet" aria-label="Bulleted list" />
        </div>

        <div className="w-px h-6 bg-gray-300" />

        <div className="flex items-center gap-1">
          <button className="ql-undo" aria-label="Undo">
            ↶
          </button>
          <button className="ql-redo" aria-label="Redo">
            ↷
          </button>
        </div>

        <div className="w-px h-6 bg-gray-300" />

        <div className="flex items-center gap-3 ml-2">
          <button
            type="button"
            onClick={() => setVariablePopupOpen(true)}
            className="flex items-center gap-2 px-3 py-2 rounded-lg border border-blue-200 text-blue-600 hover:text-blue-700 hover:bg-blue-50 transition-all duration-200 font-medium text-sm"
            aria-label="Insert Variables"
          >
            <Braces className="w-4 h-4" />
          </button>

          <button
            type="button"
            onClick={() => setConditionPopupOpen(true)}
            className="flex items-center gap-2 px-3 py-2 rounded-lg border border-purple-200 text-purple-600 hover:text-purple-700 hover:bg-purple-50 transition-all duration-200 font-medium text-sm"
            aria-label="Insert Conditions"
          >
            <Code2 className="w-4 h-4" />
          </button>
        </div>
      </div>

      <Popup
        isOpen={variablePopupOpen}
        onClose={() => setVariablePopupOpen(false)}
        options={variables}
        onSelect={onVariableSelect}
        icon={<Braces className="w-6 h-6" />}
        title="Dynamic Variables"
        color="blue"
      />

      <Popup
        isOpen={conditionPopupOpen}
        onClose={() => setConditionPopupOpen(false)}
        options={conditions}
        onSelect={onConditionSelect}
        icon={<Code2 className="w-6 h-6" />}
        title="Conditional Logic"
        color="purple"
      />
    </>
  );
}

export default function ContentEditor({
  value,
  onChange,
  className = '',
  placeholder = 'Enter content...',
  variables = ['{FirstName}', '{LastName}', '{Email}'],
  conditions = ['{{if premium}}', '{{if not premium}}', '{{if subscribed}}', '{{endif}}'],
}: ContentEditorProps) {
  const quillRef = useRef<ReactQuill>(null);

  const handleVariableSelect = (variable: string) => {
    if (quillRef.current) {
      const quill = quillRef.current.getEditor();
      const selection = quill.getSelection(true);
      if (selection) {
        quill.insertText(selection.index, variable, 'user');
        quill.setSelection(selection.index + variable.length, 0);
      }
    }
  };

  const handleConditionSelect = (condition: string) => {
    if (quillRef.current) {
      const quill = quillRef.current.getEditor();
      const selection = quill.getSelection(true);
      if (selection) {
        quill.insertText(selection.index, condition, 'user');
        quill.setSelection(selection.index + condition.length, 0);
      }
    }
  };

  const modules = useMemo(
    () => ({
      toolbar: {
        container: '#content-editor-toolbar',
        handlers: {
          undo(this: any) {
            this.quill.history.undo();
          },
          redo(this: any) {
            this.quill.history.redo();
          },
        },
      },
      history: { delay: 500, maxStack: 100, userOnly: true },
    }),
    []
  );

  const formats = useMemo(() => [
    'bold',
    'italic',
    'underline',
    'script',
    'link',
    'list',
  ], []);

  return (
    <div className={`w-full border border-gray-300 rounded-lg shadow-sm bg-white overflow-hidden ${className}`}>
      <Toolbar 
        variables={variables} 
        conditions={conditions}
        onVariableSelect={handleVariableSelect}
        onConditionSelect={handleConditionSelect}
      />
      <ReactQuill
        ref={quillRef}
        theme="snow"
        value={value ?? ''}
        onChange={onChange}
        placeholder={placeholder}
        modules={modules}
        formats={formats}
      />
    </div>
  );
}