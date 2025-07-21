import { Editor } from '@tinymce/tinymce-react';
import { cn } from '@/lib/utils';

interface TinyMCEEditorProps {
  content: string;
  onChange: (content: string) => void;
  placeholder?: string;
  className?: string;
}

export default function TinyMCEEditor({ content, onChange, placeholder, className }: TinyMCEEditorProps) {
  return (
    <div className={cn("border border-gray-300 rounded-md", className)}>
      <Editor
        tinymceScriptSrc="https://cdn.tiny.cloud/1/no-api-key/tinymce/5/tinymce.min.js"
        value={content}
        onEditorChange={(content: string) => onChange(content)}
        init={{
          height: 400,
          menubar: false,
          plugins: [
            'lists', 'link', 'charmap', 'preview', 'searchreplace', 
            'visualblocks', 'fullscreen', 'insertdatetime', 'table', 'help'
          ],
          toolbar: 'undo redo | formatselect | ' +
            'bold italic underline | alignleft aligncenter alignright alignjustify | ' +
            'bullist numlist outdent indent | removeformat | help',
          content_style: 'body { font-family: -apple-system, BlinkMacSystemFont, San Francisco, Segoe UI, Roboto, Helvetica Neue, sans-serif; font-size: 14px }',
          placeholder: placeholder,
          skin: 'oxide',
          content_css: 'default',
          branding: false,
          elementpath: false,
          statusbar: false,
          block_formats: 'Paragraph=p; Header 1=h1; Header 2=h2; Header 3=h3',

        }}
      />
    </div>
  );
}