/* eslint-disable @typescript-eslint/no-explicit-any */
import { useRef, useState, useEffect, useCallback, useMemo } from "react";
import Quill, { Delta } from "quill";
import { RichTextEditorProps } from "@/components/RichTextEditor/types";

const RichTextEditor = ({
  placeholder = "Enter",
  maxLength = 5000,
  value = "", // Ensure value defaults to an empty string
  countHide = false,
  height = "h-32",
  disable = false,
  onChange,
  label,
  required,
  name,
  showToolBar = true,
  className
}: RichTextEditorProps) => {
  maxLength = 50000;
  const [quill, setQuill] = useState<Quill | null>(null);
  const [isFocused, setIsFocused] = useState(false);
  const [editorContentLength, setEditorContentLength] = useState(0); // Track content length
  const [displayPlaceholder, setDisplayPlaceholder] = useState(true); // Control placeholder visibility

  const [formats, setFormats] = useState({
    bold: false,
    italic: false,
    underline: false,
    strike: false
  });

  const editorRef = useRef<HTMLDivElement | null>(null);
  const toolbarRef = useRef<HTMLDivElement | null>(null);
  const internalQuillValueRef = useRef(""); // To track Quill's internal HTML content
  const isSettingValueFromProp = useRef(false); // NEW: Flag to suppress onChange for prop updates

  // Helper to check if content is empty (excluding only a newline character)
  const isQuillContentEmpty = useCallback((q: Quill | null) => {
    if (!q) return true;
    const text = q.getText().trim();
    // Quill adds a trailing newline, so a length of 1 means it's empty
    return text.length === 0 && q.getLength() <= 1;
  }, []);

  // Handle text change and update formats
  const handleTextChange = useCallback(
    (q: Quill) => (_delta: Delta, oldDelta: Delta, source: string) => {
      // Update formats regardless of source
      const activeFormats = q.getFormat();
      setFormats({
        bold: !!activeFormats.bold,
        italic: !!activeFormats.italic,
        underline: !!activeFormats.underline,
        strike: !!activeFormats.strike
      });

      // Get the current content and its length
      const currentContent = q.root.innerHTML;
      const currentLength = q.getLength() - 1; // Exclude trailing newline for accurate count

      setEditorContentLength(currentLength);
      setDisplayPlaceholder(isQuillContentEmpty(q)); // Update placeholder visibility

      // Apply maxLength enforcement
      if (currentLength > maxLength) {
        // If content exceeds maxLength, revert to old state
        q.setContents(oldDelta);
        // Ensure cursor is at the end of the valid text
        q.setSelection(maxLength, 0);
        return; // Prevent further processing for this change
      }

      // NEW: Only call onChange if it's a user-initiated change AND we are NOT programmatically setting the value from props.
      // Or if the source is "api" but it's not a value prop update AND content genuinely changes (less common, but good for completeness)
      if (
        onChange &&
        !isSettingValueFromProp.current &&
        (source === "user" || internalQuillValueRef.current !== currentContent)
      ) {
        onChange(name, currentContent);
      }

      internalQuillValueRef.current = currentContent; // Keep track of the internal Quill value
    },
    [maxLength, onChange, name, isQuillContentEmpty]
  );

  useEffect(() => {
    if (editorRef.current && !quill) {
      const q = new Quill(editorRef.current, {
        theme: "snow",
        modules: {
          toolbar: showToolBar ? toolbarRef.current : false // Conditionally enable toolbar
        },
        placeholder,
        readOnly: disable
      });

      setQuill(q);

      const initialHtmlValue = String(value || ""); // Ensure it's a string

      // NEW: Set the flag BEFORE setting initial content
      isSettingValueFromProp.current = true;
      if (initialHtmlValue.length > 0) {
        const delta = q.clipboard.convert({ html: initialHtmlValue });
        q.setContents(delta);
        internalQuillValueRef.current = initialHtmlValue;
      } else {
        q.setContents([]); // Ensure Quill is empty
        internalQuillValueRef.current = "";
      }
      // NEW: Reset the flag AFTER setting initial content
      isSettingValueFromProp.current = false;

      // --- Scroll to top after setting initial content ---
      const editorElement = editorRef.current.querySelector(".ql-editor");
      if (editorElement) {
        editorElement.scrollTop = 0;
      }
      // --- END Scroll fix ---

      setEditorContentLength(q.getLength() - 1);
      setDisplayPlaceholder(isQuillContentEmpty(q));

      // Handle text change
      q.on("text-change", handleTextChange(q));

      // Patch clipboard to limit maxLength on paste with formatting preserved
      const clipboard = q.getModule("clipboard") as any;
      const originalConvert = clipboard.convert.bind(clipboard);

      clipboard.convert = (...args: any[]) => {
        const delta: Delta = originalConvert(...args);
        const currentLength = q.getLength() - 1; // exclude trailing newline
        const allowed = maxLength - currentLength;

        if (allowed <= 0) return { ops: [] };

        let used = 0;
        const trimmedOps: Delta["ops"] = [];

        for (const op of delta.ops) {
          if (typeof op.insert === "string") {
            const remaining = allowed - used;
            if (remaining <= 0) break;
            const insertText = op.insert.slice(0, remaining);
            trimmedOps.push({ ...op, insert: insertText });
            used += insertText.length;
          } else {
            // For embeds (images, formulas, etc), count as 1 char
            if (used + 1 > allowed) break;
            trimmedOps.push(op);
            used += 1;
          }
        }
        return { ops: trimmedOps };
      };

      // Styling the editor
      if (editorElement) {
        editorElement.classList.add(
          height,
          "resize-none",
          "w-full",
          "rounded-sm",
          "p-2",
          "outline-hidden"
        );
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [quill, placeholder, maxLength, showToolBar, disable]);

  // Update content if value prop changes externally
  useEffect(() => {
    const safeValue = String(value || "");

    // Only update if Quill is initialized and the external value is different
    // from Quill's internal value.
    if (quill && internalQuillValueRef.current !== safeValue) {
      // NEW: Set the flag before updating Quill from the prop
      isSettingValueFromProp.current = true;

      // Temporarily remove the listener to ensure the text-change from setContents
      // is handled by our flag, not by the source === "user" check.
      // This is crucial.
      quill.off("text-change", handleTextChange(quill));

      if (safeValue.trim() === "") {
        quill.setContents([]);
      } else {
        const delta = quill.clipboard.convert({ html: safeValue });
        quill.setContents(delta);
      }

      // --- Scroll to top after external value update ---
      const editorElement = editorRef.current?.querySelector(".ql-editor");
      if (editorElement) {
        editorElement.scrollTop = 0;
      }
      // --- END Scroll fix ---

      internalQuillValueRef.current = safeValue;
      setEditorContentLength(quill.getLength() - 1);
      setDisplayPlaceholder(isQuillContentEmpty(quill));

      // Re-add the listener
      quill.on("text-change", handleTextChange(quill));

      // NEW: Reset the flag after Quill has processed the change
      isSettingValueFromProp.current = false;
    }
  }, [value, quill, handleTextChange, isQuillContentEmpty]);

  // Toolbar toggle format handler
  const toggleFormat = useCallback(
    (format: string) => () => {
      if (disable || !quill) return;
      quill.format(format, !quill.getFormat()[format]);
      const activeFormats = quill.getFormat();
      setFormats({
        bold: !!activeFormats.bold,
        italic: !!activeFormats.italic,
        underline: !!activeFormats.underline,
        strike: !!activeFormats.strike
      });
    },
    [quill, disable]
  );

  useEffect(() => {
    if (quill) {
      quill.enable(!disable);
    }
  }, [disable, quill]);

  // Handle focus and blur for the editor container
  const handleEditorFocus = useCallback(() => {
    setIsFocused(true);
  }, []);

  const handleEditorBlur = useCallback(() => {
    setIsFocused(false);
    if (quill) {
      setDisplayPlaceholder(isQuillContentEmpty(quill));
    }
  }, [quill, isQuillContentEmpty]);

  // Toolbar buttons
  const toolbarButtons = useMemo(
    () => [
      { format: "bold", label: "B", condition: formats.bold },
      {
        format: "italic",
        label: <i>I</i>,
        condition: formats.italic,
        classNames: "font-serif italic"
      },
      {
        format: "underline",
        label: "U",
        condition: formats.underline,
        classNames: "underline"
      },
      { format: "strike", label: <s>S</s>, condition: formats.strike }
    ],
    [formats]
  );

  return (
    <div id="rich-text-editor">
      {label && (
        <label className="mb-2 block font-medium text-sm text-black">
          {label}
          {required && <span>*</span>}
        </label>
      )}
      <div
        onFocus={handleEditorFocus}
        onBlur={handleEditorBlur}
        className={`border-2 relative ${
          isFocused ? "border-primary-dark" : "border-gray-300"
        } rounded-lg ${className || ""} ${disable ? "bg-[#F4F2F0] cursor-not-allowed" : ""}`}
      >
        <div
          ref={editorRef}
          className="focus:outline-hidden focus:ring-0 font-medium w-full rounded-sm p-2 overflow-y-auto"
        ></div>

        {displayPlaceholder &&
          !isFocused && ( // Only show placeholder if not focused and content is empty
            <p className="absolute left-2 top-2 text-black opacity-50 text-sm font-medium pointer-events-none">
              {placeholder}
            </p>
          )}

        {showToolBar && (
          <div
            ref={toolbarRef}
            className="my-1 pr-3 border-t pt-1 flex items-center justify-between"
          >
            <div className="flex">
              {toolbarButtons.map(({ format, label, condition, classNames }) => (
                <div
                  key={format}
                  onClick={toggleFormat(format)}
                  className={`text-[14px] ${
                    classNames || ""
                  } font-semibold py-1 px-1 cursor-pointer border-r border-[#D9D9D9]`}
                >
                  <div
                    className={`py-1 px-3 ${
                      condition ? "bg-[#ECF3CA] rounded-lg" : ""
                    } rounded-lg w-fit`}
                  >
                    {label}
                  </div>
                </div>
              ))}
            </div>

            {!countHide && (
              <span className="opacity-[50%] text-xs">
                {`Max ${maxLength - editorContentLength} Character`}
              </span>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default RichTextEditor;
