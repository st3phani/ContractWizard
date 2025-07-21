import { useState } from 'react'
import { useEditor, EditorContent } from '@tiptap/react'
import StarterKit from '@tiptap/starter-kit'
import { TextStyle } from '@tiptap/extension-text-style'
import { Color } from '@tiptap/extension-color'
import { FontFamily } from '@tiptap/extension-font-family'
import { TextAlign } from '@tiptap/extension-text-align'
import { Underline } from '@tiptap/extension-underline'
import Image from '@tiptap/extension-image'
import { Table } from '@tiptap/extension-table'
import { TableRow } from '@tiptap/extension-table-row'
import { TableHeader } from '@tiptap/extension-table-header'
import { TableCell } from '@tiptap/extension-table-cell'
import { Extension } from '@tiptap/core'
import { Button } from '@/components/ui/button'
import { 
  Bold, 
  Italic, 
  Underline as UnderlineIcon, 
  AlignLeft, 
  AlignCenter, 
  AlignRight,
  List,
  ListOrdered,
  Image as ImageIcon,
  Table as TableIcon,
  Plus,
  Minus,
  Square,
  Grid3X3
} from 'lucide-react'

// Custom extension for font size
const FontSize = Extension.create({
  name: 'fontSize',
  
  addGlobalAttributes() {
    return [
      {
        types: ['textStyle'],
        attributes: {
          fontSize: {
            default: null,
            parseHTML: element => element.style.fontSize.replace(/['"]+/g, ''),
            renderHTML: attributes => {
              if (!attributes.fontSize) {
                return {}
              }
              return {
                style: `font-size: ${attributes.fontSize}`,
              }
            },
          },
        },
      },
    ]
  },
  
  addCommands() {
    return {
      setFontSize: (fontSize: string) => ({ chain }) => {
        return chain()
          .setMark('textStyle', { fontSize })
          .run()
      },
      unsetFontSize: () => ({ chain }) => {
        return chain()
          .setMark('textStyle', { fontSize: null })
          .removeEmptyTextStyle()
          .run()
      },
    }
  },
})

interface RichTextEditorProps {
  content: string;
  onChange: (content: string) => void;
  placeholder?: string;
  className?: string;
}

export default function RichTextEditor({ content, onChange, placeholder, className }: RichTextEditorProps) {
  const [isInTable, setIsInTable] = useState(false)

  const editor = useEditor({
    extensions: [
      StarterKit,
      TextStyle,
      FontSize,
      Color,
      FontFamily,
      TextAlign.configure({
        types: ['heading', 'paragraph'],
      }),
      Underline,
      Image.configure({
        inline: true,
        allowBase64: true,
      }),
      Table.configure({
        resizable: true,
      }),
      TableRow,
      TableHeader,
      TableCell,
    ],
    content,
    onUpdate: ({ editor }) => {
      onChange(editor.getHTML())
      // Check if cursor is in table
      const inTable = editor.isActive('table') || 
                     editor.isActive('tableRow') || 
                     editor.isActive('tableCell') || 
                     editor.isActive('tableHeader')
      setIsInTable(inTable)
    },
    onSelectionUpdate: ({ editor }) => {
      // Check if cursor is in table on selection change
      const inTable = editor.isActive('table') || 
                     editor.isActive('tableRow') || 
                     editor.isActive('tableCell') || 
                     editor.isActive('tableHeader')
      setIsInTable(inTable)
    },
    editorProps: {
      attributes: {
        class: 'focus:outline-none min-h-[300px] p-4',
      },
    },
  })

  if (!editor) {
    return null
  }

  return (
    <div className={`border border-gray-300 rounded-md ${className}`}>
      {/* Toolbar */}
      <div className="border-b border-gray-200 p-2 flex flex-wrap gap-1 bg-gray-50">
        <Button
          variant={editor.isActive('bold') ? 'default' : 'ghost'}
          size="sm"
          onClick={() => editor.chain().focus().toggleBold().run()}
          className="h-8 w-8 p-0"
        >
          <Bold className="h-4 w-4" />
        </Button>
        
        <Button
          variant={editor.isActive('italic') ? 'default' : 'ghost'}
          size="sm"
          onClick={() => editor.chain().focus().toggleItalic().run()}
          className="h-8 w-8 p-0"
        >
          <Italic className="h-4 w-4" />
        </Button>
        
        <Button
          variant={editor.isActive('underline') ? 'default' : 'ghost'}
          size="sm"
          onClick={() => editor.chain().focus().toggleUnderline().run()}
          className="h-8 w-8 p-0"
        >
          <UnderlineIcon className="h-4 w-4" />
        </Button>

        <div className="w-px h-6 bg-gray-300 mx-1" />

        <Button
          variant={editor.isActive({ textAlign: 'left' }) ? 'default' : 'ghost'}
          size="sm"
          onClick={() => editor.chain().focus().setTextAlign('left').run()}
          className="h-8 w-8 p-0"
        >
          <AlignLeft className="h-4 w-4" />
        </Button>
        
        <Button
          variant={editor.isActive({ textAlign: 'center' }) ? 'default' : 'ghost'}
          size="sm"
          onClick={() => editor.chain().focus().setTextAlign('center').run()}
          className="h-8 w-8 p-0"
        >
          <AlignCenter className="h-4 w-4" />
        </Button>
        
        <Button
          variant={editor.isActive({ textAlign: 'right' }) ? 'default' : 'ghost'}
          size="sm"
          onClick={() => editor.chain().focus().setTextAlign('right').run()}
          className="h-8 w-8 p-0"
        >
          <AlignRight className="h-4 w-4" />
        </Button>

        <div className="w-px h-6 bg-gray-300 mx-1" />

        <Button
          variant={editor.isActive('bulletList') ? 'default' : 'ghost'}
          size="sm"
          onClick={() => editor.chain().focus().toggleBulletList().run()}
          className="h-8 w-8 p-0"
        >
          <List className="h-4 w-4" />
        </Button>
        
        <Button
          variant={editor.isActive('orderedList') ? 'default' : 'ghost'}
          size="sm"
          onClick={() => editor.chain().focus().toggleOrderedList().run()}
          className="h-8 w-8 p-0"
        >
          <ListOrdered className="h-4 w-4" />
        </Button>

        <div className="w-px h-6 bg-gray-300 mx-1" />

        <select
          value=""
          onChange={(e) => {
            if (e.target.value) {
              editor.chain().focus().setFontFamily(e.target.value).run()
            }
          }}
          className="text-xs px-2 py-1 border border-gray-300 rounded"
        >
          <option value="">Font</option>
          <option value="Arial">Arial</option>
          <option value="Times New Roman">Times New Roman</option>
          <option value="Courier New">Courier New</option>
          <option value="Georgia">Georgia</option>
          <option value="Verdana">Verdana</option>
        </select>

        <select
          onChange={(e) => {
            if (e.target.value) {
              editor.chain().focus().setFontSize(e.target.value).run()
            } else {
              editor.chain().focus().unsetFontSize().run()
            }
          }}
          className="text-xs px-2 py-1 border border-gray-300 rounded"
          value={editor.getAttributes('textStyle').fontSize || ''}
        >
          <option value="">Mărime</option>
          <option value="10px">10px</option>
          <option value="12px">12px</option>
          <option value="14px">14px</option>
          <option value="16px">16px</option>
          <option value="18px">18px</option>
          <option value="20px">20px</option>
          <option value="24px">24px</option>
          <option value="32px">32px</option>
        </select>

        <input
          type="color"
          value={editor.getAttributes('textStyle').color || '#000000'}
          onChange={(e) => editor.chain().focus().setColor(e.target.value).run()}
          className="w-8 h-8 border border-gray-300 rounded cursor-pointer"
          title="Culoare text"
        />

        <div className="w-px h-6 bg-gray-300 mx-1" />

        <Button
          variant="ghost"
          size="sm"
          onClick={() => {
            const url = window.prompt('URL imagine:');
            if (url) {
              editor.chain().focus().setImage({ src: url }).run()
            }
          }}
          className="h-8 w-8 p-0"
          title="Inserare imagine"
        >
          <ImageIcon className="h-4 w-4" />
        </Button>

        <Button
          variant="ghost"
          size="sm"
          onClick={() => editor.chain().focus().insertTable({ rows: 3, cols: 3, withHeaderRow: true }).run()}
          className="h-8 w-8 p-0"
          title="Inserare tabel"
        >
          <TableIcon className="h-4 w-4" />
        </Button>

        {isInTable && (
          <>
            <div className="w-px h-6 bg-gray-300 mx-1" />
            
            <Button
              variant="ghost"
              size="sm"
              onClick={() => editor.chain().focus().addRowBefore().run()}
              className="h-8 w-8 p-0"
              title="Adaugă rând înainte"
            >
              <Plus className="h-4 w-4" />
            </Button>
            
            <Button
              variant="ghost"
              size="sm"
              onClick={() => editor.chain().focus().addRowAfter().run()}
              className="h-8 w-8 p-0"
              title="Adaugă rând după"
            >
              <Plus className="h-4 w-4" />
            </Button>
            
            <Button
              variant="ghost"
              size="sm"
              onClick={() => editor.chain().focus().deleteRow().run()}
              className="h-8 w-8 p-0"
              title="Șterge rând"
            >
              <Minus className="h-4 w-4" />
            </Button>

            <Button
              variant="ghost"
              size="sm"
              onClick={() => editor.chain().focus().addColumnBefore().run()}
              className="h-8 w-8 p-0"
              title="Adaugă coloană înainte"
            >
              <Plus className="h-4 w-4 rotate-90" />
            </Button>
            
            <Button
              variant="ghost"
              size="sm"
              onClick={() => editor.chain().focus().addColumnAfter().run()}
              className="h-8 w-8 p-0"
              title="Adaugă coloană după"
            >
              <Plus className="h-4 w-4 rotate-90" />
            </Button>
            
            <Button
              variant="ghost"
              size="sm"
              onClick={() => editor.chain().focus().deleteColumn().run()}
              className="h-8 w-8 p-0"
              title="Șterge coloană"
            >
              <Minus className="h-4 w-4 rotate-90" />
            </Button>

            <div className="w-px h-6 bg-gray-300 mx-1" />

            <Button
              variant="ghost"
              size="sm"
              onClick={() => {
                const table = editor.getAttributes('table');
                const newClass = table.class === 'no-border' ? '' : 'no-border';
                editor.chain().focus().updateAttributes('table', { class: newClass }).run();
              }}
              className="h-8 w-8 p-0"
              title="Toggle border tabel"
            >
              {editor.getAttributes('table').class === 'no-border' ? <Grid3X3 className="h-4 w-4" /> : <Square className="h-4 w-4" />}
            </Button>

            <Button
              variant="ghost"
              size="sm"
              onClick={() => editor.chain().focus().deleteTable().run()}
              className="h-8 w-8 p-0"
              title="Șterge tabel"
            >
              <TableIcon className="h-4 w-4 text-red-500" />
            </Button>
          </>
        )}
      </div>

      {/* Editor Content */}
      <div className="min-h-[300px]">
        <EditorContent 
          editor={editor} 
        />
      </div>
      
      <style>{`
        .ProseMirror {
          outline: none !important;
          font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
          font-size: 14px;
          line-height: 1.4;
        }
        .ProseMirror p {
          margin: 0.5em 0;
          line-height: 1.4;
        }
        .ProseMirror h1, .ProseMirror h2, .ProseMirror h3 {
          margin: 0.8em 0 0.5em 0;
          line-height: 1.3;
        }
        .ProseMirror ul, .ProseMirror ol {
          margin: 0.5em 0;
          padding-left: 1.5em;
        }
        .ProseMirror li {
          margin: 0.2em 0;
        }
        .ProseMirror table {
          border-collapse: collapse;
          table-layout: fixed;
          width: 100%;
          margin: 0.5em 0;
          overflow: hidden;
        }
        .ProseMirror table td, .ProseMirror table th {
          min-width: 1em;
          border: 2px solid #ced4da;
          padding: 8px 12px;
          vertical-align: top;
          box-sizing: border-box;
          position: relative;
          line-height: 1.4;
        }
        .ProseMirror table th {
          font-weight: bold;
          text-align: left;
          background-color: #f1f3f4;
        }
        .ProseMirror table.no-border td, .ProseMirror table.no-border th {
          border: none;
        }
        .ProseMirror table.no-border th {
          background-color: transparent;
        }
        .ProseMirror img {
          max-width: 100%;
          height: auto;
          margin: 0.5em 0;
        }
        .ProseMirror [style*="font-size"] {
          line-height: 1.3;
        }
      `}</style>
    </div>
  )
}