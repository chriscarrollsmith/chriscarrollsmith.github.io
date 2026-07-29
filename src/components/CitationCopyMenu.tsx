import { useEffect, useId, useRef, useState } from 'react';
import type { CitationStyle, CSLItem } from '../utils/citationFormats';
import { copyCitation } from '../utils/citationFormats';

const STYLES: { id: CitationStyle; label: string }[] = [
  { id: 'bibtex', label: 'BibTeX' },
  { id: 'apa', label: 'APA' },
  { id: 'chicago', label: 'Chicago' },
];

interface CitationCopyMenuProps {
  item: CSLItem;
  title: string;
}

const CitationCopyMenu: React.FC<CitationCopyMenuProps> = ({ item, title }) => {
  const menuId = useId();
  const rootRef = useRef<HTMLDivElement>(null);
  const [open, setOpen] = useState(false);
  const [status, setStatus] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    if (!open) return;

    const onPointerDown = (event: MouseEvent) => {
      if (!rootRef.current?.contains(event.target as Node)) {
        setOpen(false);
      }
    };
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setOpen(false);
    };

    document.addEventListener('mousedown', onPointerDown);
    document.addEventListener('keydown', onKeyDown);
    return () => {
      document.removeEventListener('mousedown', onPointerDown);
      document.removeEventListener('keydown', onKeyDown);
    };
  }, [open]);

  useEffect(() => {
    if (!status) return;
    const timer = window.setTimeout(() => setStatus(null), 2000);
    return () => window.clearTimeout(timer);
  }, [status]);

  const handleCopy = async (style: CitationStyle) => {
    setBusy(true);
    try {
      await copyCitation(item, style);
      setStatus(`Copied ${STYLES.find((s) => s.id === style)?.label ?? style}`);
      setOpen(false);
    } catch (error) {
      console.error('Failed to copy citation:', error);
      setStatus('Copy failed');
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="citation-copy" ref={rootRef}>
      <button
        type="button"
        className="citation-copy-toggle"
        aria-haspopup="menu"
        aria-expanded={open}
        aria-controls={menuId}
        disabled={busy}
        onClick={() => setOpen((value) => !value)}
      >
        Cite
        <span className="visually-hidden"> {title}</span>
      </button>
      {open && (
        <ul id={menuId} className="citation-copy-menu" role="menu">
          {STYLES.map((style) => (
            <li key={style.id} role="none">
              <button
                type="button"
                role="menuitem"
                className="citation-copy-option"
                onClick={() => void handleCopy(style.id)}
              >
                Copy {style.label}
              </button>
            </li>
          ))}
        </ul>
      )}
      <span className="visually-hidden" aria-live="polite">
        {status}
      </span>
      {status && !status.startsWith('Copy failed') && (
        <span className="citation-copy-status" aria-hidden="true">
          {status}
        </span>
      )}
    </div>
  );
};

export default CitationCopyMenu;
