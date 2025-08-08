import React, { useMemo } from 'react';
import ReactQuill from 'react-quill';
import 'react-quill/dist/quill.snow.css';

type ContentEditorProps = {
  value: string;
  onChange: (html: string) => void;
  className?: string;
  placeholder?: string;
};

function Toolbar() {
  return (
    <div id="content-editor-toolbar" className="flex items-center gap-1 p-1 border-b">
      {/* Bold / Italic / Underline */}
      <button className="ql-bold" aria-label="Bold" />
      <button className="ql-italic" aria-label="Italic" />
      <button className="ql-underline" aria-label="Underline" />

      <span className="mx-1">|</span>

      {/* Superscript / Subscript */}
      <button className="ql-script" value="super" aria-label="Superscript" />
      <button className="ql-script" value="sub" aria-label="Subscript" />

      <span className="mx-1">|</span>

      {/* Link */}
      <button className="ql-link" aria-label="Link" />

      <span className="mx-1">|</span>

      {/* Lists */}
      <button className="ql-list" value="ordered" aria-label="Numbered list" />
      <button className="ql-list" value="bullet" aria-label="Bulleted list" />

      <span className="mx-1">|</span>

      {/* Undo / Redo (custom handlers below) */}
      <button className="ql-undo" aria-label="Undo">↶</button>
      <button className="ql-redo" aria-label="Redo">↷</button>
    </div>
  );
}

export default function ContentEditor({
  value,
  onChange,
  className = '',
  placeholder = 'Enter content...',
}: ContentEditorProps) {
  const modules = useMemo(
    () => ({
      toolbar: {
        container: '#content-editor-toolbar',
        handlers: {
          // custom buttons
          undo(this: any) {
            this.quill.history.undo();
          },
          redo(this: any) {
            this.quill.history.redo();
          },
        },
      },
      history: { delay: 500, maxStack: 100, userOnly: true },
      // keep Quill lean — no more modules than needed
    }),
    []
  );

  // Only allow exactly these formats
  const formats = useMemo(
    () => ['bold', 'italic', 'underline', 'script', 'link', 'list'],
    []
  );

  return (
    <div
      className={
        'w-full border border-gray-300 dark:border-gray-600 rounded-lg shadow-sm bg-white dark:bg-gray-700 ' +
        className
      }
    >
      <Toolbar />
      <ReactQuill
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