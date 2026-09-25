import { useEffect, useId, useRef } from "react";
export default function Modal({ title, children, onClose }) {
  const ref = useRef(null);
  const titleId = useId();
  useEffect(() => {
    const dialog = ref.current;
    dialog.showModal();
    return () => dialog.close();
  }, []);
  return (
    <dialog
      ref={ref}
      aria-labelledby={titleId}
      onCancel={(e) => {
        e.preventDefault();
        onClose();
      }}
      className="m-auto max-h-[90vh] w-[calc(100%_-_32px)] max-w-xl overflow-y-auto rounded-xl border-0 bg-white p-6 text-[#233d33] shadow-xl backdrop:bg-black/40"
    >
      <div className="mb-5 flex items-center justify-between gap-4">
        <h3 id={titleId} className="font-volkhov text-2xl">
          {title}
        </h3>
        <button
          type="button"
          onClick={onClose}
          className="text-button"
          aria-label="Close dialog"
        >
          Close ×
        </button>
      </div>
      {children}
    </dialog>
  );
}
