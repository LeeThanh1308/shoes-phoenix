"use client";

import "quill/dist/quill.snow.css"; // Import Quill styles

import React, {
  forwardRef,
  memo,
  useEffect,
  useImperativeHandle,
  useRef,
} from "react";

// Xóa import Quill và ImageResize ở đầu file
// RichTextEditor component
const RichTextEditor = forwardRef(
  ({ onChange = () => null, value, height = "500px" }, ref) => {
    const editorRef = useRef(null);
    const quillRef = useRef(null);
    useEffect(() => {
      let Quill = null;
      let timerID;
      let isMounted = true;
      (async () => {
        if (typeof window !== "undefined") {
          const quillModule = await import("quill");
          Quill = quillModule.default ?? quillModule;
          const { default: ImageResize } = await import(
            "quill-image-resize-module-react"
          );
          Quill.register("modules/imageResize", ImageResize);
          timerID = setTimeout(() => {
            if (editorRef.current && !quillRef.current && isMounted) {
              quillRef.current = new Quill(editorRef.current, {
                theme: "snow",
                modules: {
                  toolbar: [
                    [{ font: [] }],
                    [{ size: ["small", false, "large", "huge"] }],
                    [{ header: [1, 2, 3, 4, 5, 6, false] }],
                    ["bold", "italic", "underline", "strike"],
                    [{ color: [] }, { background: [] }],
                    [{ script: "sub" }, { script: "super" }],
                    [{ list: "ordered" }, { list: "bullet" }],
                    [{ indent: "-1" }, { indent: "+1" }],
                    [{ direction: "rtl" }],
                    [{ align: [] }],
                    ["blockquote", "code-block"],
                    ["link", "image", "video", "formula"],
                    ["clean"],
                  ],
                  imageResize: {
                    modules: ["Resize", "DisplaySize", "Toolbar"],
                    handleStyles: {
                      backgroundColor: "black",
                      border: "1px solid white",
                      borderRadius: "4px",
                      width: "12px",
                      height: "12px",
                    },
                  },
                },
                placeholder: "Write something...",
              });
              if (value) quillRef.current.root.innerHTML = value;
              quillRef.current.on("text-change", () => {
                const content = quillRef.current.root.innerHTML;
                onChange(content);
              });
            }
          }, 500);
        }
      })();
      return () => {
        isMounted = false;
        quillRef.current = null; // Cleanup to avoid memory leaks
        if (timerID) clearTimeout(timerID); // Clear the timer on component unmount
      };
    }, [ref]);

    // Expose the getContent function to the parent component
    useImperativeHandle(ref, () => ({
      getContent: () => {
        if (quillRef.current) {
          return quillRef.current.root.innerHTML; // Return the HTML content
        }
        return "";
      },
    }));

    return <div ref={editorRef} style={{ height: height }} />;
  }
);

RichTextEditor.displayName = "RichTextEditor";
export default memo(RichTextEditor);
