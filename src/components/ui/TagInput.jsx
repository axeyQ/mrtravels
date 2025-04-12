"use client";
import { useState, useRef } from 'react';
import { X, Plus } from 'lucide-react';

export default function TagInput({ tags = [], onChange, readOnly = false, placeholderText = "Add tags..." }) {
  const [inputValue, setInputValue] = useState('');
  const [isInputFocused, setIsInputFocused] = useState(false);
  const inputRef = useRef(null);

  // Handle adding a new tag
  const handleAddTag = () => {
    if (readOnly) return;
    
    const trimmedValue = inputValue.trim();
    if (!trimmedValue) return;
    
    // Check if tag already exists (case insensitive)
    const tagExists = tags.some(tag => tag.toLowerCase() === trimmedValue.toLowerCase());
    
    if (!tagExists) {
      const newTags = [...tags, trimmedValue];
      onChange(newTags);
    }
    
    setInputValue('');
  };

  // Handle removing a tag
  const handleRemoveTag = (indexToRemove) => {
    if (readOnly) return;
    
    const newTags = tags.filter((_, index) => index !== indexToRemove);
    onChange(newTags);
  };

  // Handle key events
  const handleKeyDown = (e) => {
    if (readOnly) return;
    
    // Add tag on Enter or comma
    if (e.key === 'Enter' || e.key === ',') {
      e.preventDefault();
      handleAddTag();
    }
    
    // Remove last tag on Backspace if input is empty
    if (e.key === 'Backspace' && inputValue === '' && tags.length > 0) {
      handleRemoveTag(tags.length - 1);
    }
  };

  return (
    <div
      className={`flex flex-wrap items-center gap-2 p-2 border rounded-md ${
        isInputFocused ? 'border-primary' : 'border-gray-300'
      } ${readOnly ? 'bg-gray-50' : 'bg-white'}`}
      onClick={() => !readOnly && inputRef.current?.focus()}
    >
      {tags.map((tag, index) => (
        <div
          key={index}
          className="flex items-center bg-blue-50 text-blue-700 px-2 py-1 rounded-md text-sm"
        >
          <span>{tag}</span>
          {!readOnly && (
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                handleRemoveTag(index);
              }}
              className="ml-1 text-blue-500 hover:text-blue-700"
            >
              <X className="h-3 w-3" />
            </button>
          )}
        </div>
      ))}
      
      {!readOnly && (
        <input
          ref={inputRef}
          type="text"
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          onKeyDown={handleKeyDown}
          onBlur={() => {
            handleAddTag();
            setIsInputFocused(false);
          }}
          onFocus={() => setIsInputFocused(true)}
          className="flex-1 outline-none min-w-[120px] bg-transparent text-sm"
          placeholder={tags.length === 0 ? placeholderText : ""}
        />
      )}
      
      {!readOnly && inputValue && (
        <button
          type="button"
          onClick={handleAddTag}
          className="text-blue-600 hover:text-blue-800"
        >
          <Plus className="h-4 w-4" />
        </button>
      )}
    </div>
  );
}