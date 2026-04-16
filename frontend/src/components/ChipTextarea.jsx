import React, {
  forwardRef,
  useRef,
  useEffect,
  useState,
  useCallback,
  useImperativeHandle,
} from 'react';

// ─── helpers ────────────────────────────────────────────────────────────────

function chipHtml(key, label, color) {
  return (
    `<span contenteditable="false" data-var="${key}" ` +
    `style="display:inline-block;background:${color}22;border:1px solid ${color}66;` +
    `color:${color};border-radius:4px;padding:0 6px;margin:0 2px;font-size:0.78em;` +
    `font-weight:800;cursor:default;user-select:none;white-space:nowrap;">(${label})</span>`
  );
}

function valueToHtml(val, variables) {
  if (!val) return '';
  const parts = val.split(/(\([^)\s]+\))/g);
  return parts
    .map(part => {
      const m = part.match(/^\(([^)\s]+)\)$/);
      if (m) {
        const key = m[1];
        const v = (window._zapAllVars || variables || []).find(x => x.key === key);
        const color = v?.color || '#34b7f1';
        const label = v?.label || key;
        return chipHtml(key, label, color);
      }
      return part
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/\n/g, '<br>');
    })
    .join('');
}

function htmlToValue(container) {
  let result = '';
  container.childNodes.forEach(node => {
    if (node.nodeType === 3) {
      result += node.textContent;
    } else if (node.nodeType === 1) {
      const varKey = node.getAttribute?.('data-var');
      if (varKey) {
        result += `(${varKey})`;
      } else if (node.tagName === 'BR') {
        result += '\n';
      } else {
        result += node.textContent;
      }
    }
  });
  return result;
}

// ─── component ──────────────────────────────────────────────────────────────

const ChipTextarea = forwardRef(function ChipTextarea(
  {
    value = '',
    onChange,
    variables = [],
    placeholder = 'Digite o texto...',
    style = {},
    onFocus,
    onBlur,
    onRegisterInsert,
  },
  ref
) {
  const divRef = useRef(null);
  const lastValRef = useRef(value);
  const [dropdown, setDropdown] = useState(null);
  const [ddIdx, setDdIdx] = useState(0);

  // ── init ──────────────────────────────────────────────────────────────────
  useEffect(() => {
    if (divRef.current) {
      divRef.current.innerHTML = valueToHtml(value, variables);
      lastValRef.current = value;
    }
  }, []); // eslint-disable-line

  // ── sync from outside (only when not focused) ─────────────────────────────
  useEffect(() => {
    if (!divRef.current) return;
    if (lastValRef.current === value) return;
    if (document.activeElement === divRef.current) return;
    divRef.current.innerHTML = valueToHtml(value, variables);
    lastValRef.current = value;
  }, [value]); // eslint-disable-line

  // ── insert variable programmatically (called from panel) ──────────────────
  const insertVar = useCallback(
    variable => {
      const div = divRef.current;
      if (!div) return;

      div.focus();

      const sel = window.getSelection();
      let range;

      if (sel && sel.rangeCount > 0 && div.contains(sel.getRangeAt(0).startContainer)) {
        range = sel.getRangeAt(0);
      } else {
        // Cursor not inside div — place at end
        range = document.createRange();
        range.selectNodeContents(div);
        range.collapse(false);
        sel?.removeAllRanges();
        sel?.addRange(range);
      }

      // Delete any /query before cursor
      if (range.startContainer.nodeType === 3) {
        const textNode = range.startContainer;
        const text = textNode.textContent;
        const offset = range.startOffset;
        const before = text.slice(0, offset);
        const slashIdx = before.lastIndexOf('/');
        if (slashIdx !== -1) {
          textNode.textContent =
            text.slice(0, slashIdx) + text.slice(offset);
          range.setStart(textNode, slashIdx);
          range.setEnd(textNode, slashIdx);
        }
      }

      // Build chip element
      const chip = document.createElement('span');
      chip.contentEditable = 'false';
      chip.setAttribute('data-var', variable.key);
      const color = variable.color || '#34b7f1';
      chip.style.cssText =
        `display:inline-block;background:${color}22;border:1px solid ${color}66;` +
        `color:${color};border-radius:4px;padding:0 6px;margin:0 2px;font-size:0.78em;` +
        `font-weight:800;cursor:default;user-select:none;white-space:nowrap;`;
      chip.textContent = `(${variable.label})`;

      range.insertNode(chip);

      // Move cursor after chip
      range.setStartAfter(chip);
      range.setEndAfter(chip);
      sel?.removeAllRanges();
      sel?.addRange(range);

      const newVal = htmlToValue(div);
      lastValRef.current = newVal;
      onChange?.(newVal);
      setDropdown(null);
    },
    [onChange]
  );

  // Expose insert + focus via ref (forwardRef)
  useImperativeHandle(ref, () => ({
    insert: insertVar,
    focus: () => divRef.current?.focus(),
  }));

  // ── slash dropdown ─────────────────────────────────────────────────────────
  const checkSlash = useCallback(() => {
    const sel = window.getSelection();
    if (!sel || sel.rangeCount === 0) { setDropdown(null); return; }
    const range = sel.getRangeAt(0);
    if (range.startContainer.nodeType !== 3) { setDropdown(null); return; }

    const text = range.startContainer.textContent;
    const offset = range.startOffset;
    const before = text.slice(0, offset);
    const slashIdx = before.lastIndexOf('/');

    if (slashIdx === -1) { setDropdown(null); return; }

    const query = before.slice(slashIdx + 1);
    if (query.includes(' ') && query.length > 0) { setDropdown(null); return; }

    const rects = range.getClientRects();
    const rect = rects[0] || range.getBoundingClientRect();
    const containerRect = divRef.current.getBoundingClientRect();

    setDropdown({
      top: rect.bottom - containerRect.top + 4,
      left: Math.max(0, rect.left - containerRect.left),
      query: query.toLowerCase(),
    });
    setDdIdx(0);
  }, []);

  const getFiltered = useCallback(() => {
    if (!dropdown) return [];
    const allVars = window._zapAllVars || variables;
    return allVars
      .filter(
        v =>
          v.label.toLowerCase().includes(dropdown.query) ||
          v.key.toLowerCase().includes(dropdown.query)
      )
      .slice(0, 8);
  }, [dropdown, variables]);

  // ── event handlers ─────────────────────────────────────────────────────────
  const handleInput = useCallback(() => {
    if (!divRef.current) return;
    const val = htmlToValue(divRef.current);
    lastValRef.current = val;
    onChange?.(val);
    checkSlash();
  }, [onChange, checkSlash]);

  const handleKeyDown = useCallback(
    e => {
      const filtered = getFiltered();

      if (dropdown && filtered.length > 0) {
        if (e.key === 'ArrowDown') {
          e.preventDefault();
          setDdIdx(i => Math.min(i + 1, filtered.length - 1));
          return;
        }
        if (e.key === 'ArrowUp') {
          e.preventDefault();
          setDdIdx(i => Math.max(i - 1, 0));
          return;
        }
        if (e.key === 'Enter' || e.key === 'Tab') {
          e.preventDefault();
          insertVar(filtered[ddIdx] || filtered[0]);
          return;
        }
        if (e.key === 'Escape') {
          setDropdown(null);
          return;
        }
      }

      if (e.key === 'Backspace') {
        const sel = window.getSelection();
        if (!sel || sel.rangeCount === 0 || !sel.isCollapsed) return;
        const range = sel.getRangeAt(0);

        let prevSibling = null;
        if (range.startOffset === 0) {
          prevSibling = range.startContainer.previousSibling;
        }

        if (
          prevSibling &&
          prevSibling.nodeType === 1 &&
          prevSibling.getAttribute?.('data-var')
        ) {
          e.preventDefault();
          range.setStartBefore(prevSibling);
          range.setEndBefore(prevSibling);
          sel.removeAllRanges();
          sel.addRange(range);
          prevSibling.remove();

          const val = htmlToValue(divRef.current);
          lastValRef.current = val;
          onChange?.(val);
        }
      }
    },
    [dropdown, ddIdx, getFiltered, insertVar, onChange]
  );

  const handleFocus = useCallback(() => {
    // Register this instance as the active insert target
    window._zapInsertToFocused = insertVar;
    onRegisterInsert?.(insertVar);
    onFocus?.();
  }, [insertVar, onRegisterInsert, onFocus]);

  const handleBlur = useCallback(() => {
    setTimeout(() => setDropdown(null), 150);
    onBlur?.();
  }, [onBlur]);

  const filtered = getFiltered();
  const isEmpty = !value || value === '';

  return (
    <div style={{ position: 'relative' }}>
      {isEmpty && (
        <div
          style={{
            position: 'absolute',
            top: '10px',
            left: '12px',
            color: 'rgba(255,255,255,0.2)',
            fontSize: '0.83rem',
            pointerEvents: 'none',
            userSelect: 'none',
            lineHeight: '1.5',
          }}
        >
          {placeholder}
        </div>
      )}

      <div
        ref={divRef}
        contentEditable
        suppressContentEditableWarning
        className="nodrag"
        onMouseDown={e => e.stopPropagation()}
        onInput={handleInput}
        onKeyDown={handleKeyDown}
        onFocus={handleFocus}
        onBlur={handleBlur}
        style={{
          minHeight: '80px',
          padding: '10px 12px',
          lineHeight: '1.6',
          fontSize: '0.83rem',
          wordBreak: 'break-word',
          whiteSpace: 'pre-wrap',
          outline: 'none',
          cursor: 'text',
          ...style,
        }}
      />

      {dropdown && filtered.length > 0 && (
        <div
          style={{
            position: 'absolute',
            top: dropdown.top,
            left: dropdown.left,
            zIndex: 9999,
            background: '#131a13',
            border: '1px solid rgba(37,211,102,0.35)',
            borderRadius: '8px',
            minWidth: '190px',
            maxWidth: '260px',
            boxShadow: '0 8px 24px rgba(0,0,0,0.6)',
            overflow: 'hidden',
          }}
        >
          <div
            style={{
              padding: '4px 10px',
              fontSize: '0.55rem',
              color: 'rgba(255,255,255,0.3)',
              fontWeight: '800',
              letterSpacing: '1px',
              borderBottom: '1px solid rgba(255,255,255,0.06)',
            }}
          >
            VARIÁVEIS — tecle Enter para inserir
          </div>
          {filtered.map((v, i) => (
            <div
              key={v.key}
              onMouseDown={e => { e.preventDefault(); insertVar(v); }}
              style={{
                padding: '7px 10px',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                background: i === ddIdx ? 'rgba(255,255,255,0.07)' : 'transparent',
              }}
            >
              <span
                style={{
                  width: '6px',
                  height: '6px',
                  borderRadius: '50%',
                  background: v.color,
                  flexShrink: 0,
                }}
              />
              <span style={{ fontSize: '0.73rem', color: '#fff', fontWeight: '600' }}>
                {v.label}
              </span>
              <span
                style={{
                  fontSize: '0.58rem',
                  color: 'rgba(255,255,255,0.25)',
                  marginLeft: 'auto',
                  flexShrink: 0,
                }}
              >
                {v.category}
              </span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
});

export default ChipTextarea;
