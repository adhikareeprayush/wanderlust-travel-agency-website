import { useEffect, useId, useRef } from "react";
import Icon from "../Icon";
export default function Modal({ title, description, children, onClose, size }) {
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
      onClick={(e) => {
        if (e.target === ref.current) onClose();
      }}
      className={`portal-modal${size ? ` is-${size}` : ""}`}
    >
      <div className="portal-modal-inner">
        <div className="portal-modal-header">
          <div>
            <h3 id={titleId}>{title}</h3>
            {description && <p>{description}</p>}
          </div>
          <button
            type="button"
            onClick={onClose}
            className="portal-icon-btn"
            aria-label="Close dialog"
          >
            <Icon name="close" size={16} />
          </button>
        </div>
        {children}
      </div>
    </dialog>
  );
}
