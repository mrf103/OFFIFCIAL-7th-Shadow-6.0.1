import { useEffect, useState, useRef } from 'react';
import { useCollaboration } from '@/contexts/CollaborationContext';
import { useAuth } from '@/contexts/AuthContext';
import { Card } from '@/Components/ui/card';

const CollaborativeEditor = ({ documentId, initialContent, onSave }) => {
  const { user } = useAuth();
  const { 
    activeUsers, 
    initCollaboration, 
    endCollaboration, 
    broadcastChange,
    broadcastCursor,
    changes 
  } = useCollaboration();

  const [content, setContent] = useState(initialContent || '');
  const [isSaving, setIsSaving] = useState(false);
  const editorRef = useRef(null);
  const lastChangeRef = useRef(null);

  // Initialize collaboration when component mounts
  useEffect(() => {
    if (documentId && user) {
      initCollaboration(documentId, user.id);
    }

    return () => {
      endCollaboration();
    };
  }, [documentId, user, initCollaboration, endCollaboration]);

  // Handle remote changes
  useEffect(() => {
    if (changes.length > 0) {
      const latestChange = changes[changes.length - 1];
      
      // Don't apply our own changes
      if (latestChange.userId !== user?.id) {
        applyRemoteChange(latestChange);
      }
    }
  }, [changes, user]);

  // Apply remote change to editor
  const applyRemoteChange = (change) => {
    if (!editorRef.current) return;

    const { type, position, text, length } = change;

    if (type === 'insert') {
      const before = content.substring(0, position);
      const after = content.substring(position);
      setContent(before + text + after);
    } else if (type === 'delete') {
      const before = content.substring(0, position);
      const after = content.substring(position + length);
      setContent(before + after);
    }
  };

  // Handle local changes
  const handleChange = (e) => {
    const newContent = e.target.value;
    const oldContent = content;

    // Detect change type and position
    let change = null;
    if (newContent.length > oldContent.length) {
      // Insert
      const position = findDifferencePosition(oldContent, newContent);
      change = {
        type: 'insert',
        position,
        text: newContent.substring(position, position + (newContent.length - oldContent.length)),
        userId: user?.id
      };
    } else if (newContent.length < oldContent.length) {
      // Delete
      const position = findDifferencePosition(oldContent, newContent);
      change = {
        type: 'delete',
        position,
        length: oldContent.length - newContent.length,
        userId: user?.id
      };
    }

    setContent(newContent);

    // Broadcast change
    if (change) {
      lastChangeRef.current = change;
      broadcastChange(change);
    }
  };

  // Find position where strings differ
  const findDifferencePosition = (str1, str2) => {
    for (let i = 0; i < Math.max(str1.length, str2.length); i++) {
      if (str1[i] !== str2[i]) {
        return i;
      }
    }
    return 0;
  };

  // Handle cursor movement
  const handleCursorMove = (e) => {
    const position = e.target.selectionStart;
    broadcastCursor(position);
  };

  // Save content
  const handleSave = async () => {
    setIsSaving(true);
    try {
      await onSave(content);
    } catch (error) {
      console.error('Error saving:', error);
    } finally {
      setIsSaving(false);
    }
  };

  // Auto-save every 5 seconds
  useEffect(() => {
    const timer = setInterval(() => {
      if (content !== initialContent) {
        handleSave();
      }
    }, 5000);

    return () => clearInterval(timer);
  }, [content, initialContent]);

  return (
    <div className="space-y-4">
      {/* Active Users Bar */}
      <Card className="p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="flex -space-x-2">
              {activeUsers.slice(0, 5).map((user) => (
                <div
                  key={user.userId}
                  className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-500 to-purple-500 border-2 border-white flex items-center justify-center text-white text-sm font-medium"
                  title={user.userId}
                >
                  {user.userId.charAt(0).toUpperCase()}
                </div>
              ))}
              {activeUsers.length > 5 && (
                <div className="w-8 h-8 rounded-full bg-gray-300 border-2 border-white flex items-center justify-center text-gray-700 text-xs font-medium">
                  +{activeUsers.length - 5}
                </div>
              )}
            </div>
            <span className="text-sm text-gray-600">
              {activeUsers.length} {activeUsers.length === 1 ? 'مستخدم نشط' : 'مستخدمون نشطون'}
            </span>
          </div>

          <div className="flex items-center gap-2">
            {isSaving ? (
              <span className="text-sm text-gray-500">
                <span className="inline-block animate-spin mr-2">⚙️</span>
                جاري الحفظ...
              </span>
            ) : (
              <span className="text-sm text-green-600">
                ✅ تم الحفظ
              </span>
            )}
          </div>
        </div>
      </Card>

      {/* Editor */}
      <Card className="p-4">
        <textarea
          ref={editorRef}
          value={content}
          onChange={handleChange}
          onSelect={handleCursorMove}
          className="w-full h-[500px] p-4 border rounded-lg resize-none focus:outline-none focus:ring-2 focus:ring-blue-500"
          placeholder="ابدأ الكتابة..."
          dir="rtl"
        />
      </Card>

      {/* Status Bar */}
      <Card className="p-3">
        <div className="flex items-center justify-between text-sm text-gray-600">
          <div className="flex gap-4">
            <span>الكلمات: {content.split(/\s+/).filter(Boolean).length}</span>
            <span>الأحرف: {content.length}</span>
          </div>
          <button
            onClick={handleSave}
            disabled={isSaving}
            className="px-4 py-1 bg-blue-500 text-white rounded-lg hover:bg-blue-600 disabled:opacity-50"
          >
            {isSaving ? 'جاري الحفظ...' : 'حفظ'}
          </button>
        </div>
      </Card>

      {/* Recent Changes Indicator */}
      {changes.length > 0 && (
        <Card className="p-3 bg-blue-50 border-blue-200">
          <div className="text-sm text-blue-800">
            <span className="inline-block w-2 h-2 bg-blue-500 rounded-full animate-pulse mr-2"></span>
            تم تطبيق {changes.length} تغيير من المتعاونين
          </div>
        </Card>
      )}
    </div>
  );
};

export default CollaborativeEditor;
