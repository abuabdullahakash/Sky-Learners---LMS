"use client";

import React, { useMemo } from 'react';
import dynamic from 'next/dynamic';
import 'react-quill-new/dist/quill.snow.css'; // Import Quill styles

// Dynamically import ReactQuill to disable SSR
const ReactQuill = dynamic(() => import('react-quill-new'), { 
  ssr: false, 
  loading: () => <div className="h-64 w-full bg-foreground/5 animate-pulse rounded-2xl flex items-center justify-center text-foreground/50">Loading editor...</div>
});

interface RichTextEditorProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
}

export const RichTextEditor: React.FC<RichTextEditorProps> = ({ value, onChange, placeholder }) => {
  // Define custom toolbar modules
  const modules = useMemo(() => ({
    toolbar: [
      [{ 'header': [1, 2, 3, 4, 5, 6, false] }],
      ['bold', 'italic', 'underline', 'strike'],        // toggled buttons
      [{ 'color': [] }, { 'background': [] }],          // dropdown with defaults from theme
      [{ 'list': 'ordered'}, { 'list': 'bullet' }],
      [{ 'indent': '-1'}, { 'indent': '+1' }],          // outdent/indent
      [{ 'align': [] }],
      ['link', 'image', 'video'],
      ['clean']                                         // remove formatting button
    ],
  }), []);

  const formats = [
    'header',
    'bold', 'italic', 'underline', 'strike',
    'color', 'background',
    'list', 'bullet', 'indent',
    'align',
    'link', 'image', 'video'
  ];

  return (
    <div className="rich-text-editor-container bg-background text-foreground rounded-2xl overflow-hidden border border-foreground/20 [&_.ql-toolbar]:border-b [&_.ql-toolbar]:border-foreground/20 [&_.ql-toolbar]:bg-foreground/5 [&_.ql-container]:border-none [&_.ql-container]:text-foreground [&_.ql-editor]:min-h-[200px] [&_.ql-editor]:text-base [&_.ql-editor]:p-4 [&_.ql-picker-label]:text-foreground [&_.ql-stroke]:stroke-foreground [&_.ql-fill]:fill-foreground [&_.ql-picker-options]:bg-background [&_.ql-picker-options]:border-foreground/20 [&_.ql-picker-item]:text-foreground [&_.ql-picker-item:hover]:text-primary">
      <ReactQuill 
        theme="snow" 
        value={value} 
        onChange={onChange}
        modules={modules}
        formats={formats}
        placeholder={placeholder}
      />
    </div>
  );
};
