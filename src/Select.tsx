import { useEffect, useId, useRef, useState } from "react";
import type { KeyboardEvent as ReactKeyboardEvent, ReactNode } from "react";
import { Check, ChevronDown, X } from "lucide-react";

export type SelectOption = { value: string; label: string; meta?: string };
export type SelectGroup = { label?: string; options: SelectOption[] };

type SelectProps = {
  id: string;
  value: string;
  groups: SelectGroup[];
  onChange: (value: string) => void;
  /** Título da folha inferior no mobile — normalmente o mesmo texto do <label>. */
  title: string;
  closeLabel: string;
  icon?: ReactNode;
  compact?: boolean;
};

/**
 * Substituto do <select> nativo no padrão "select-only combobox" da WAI-ARIA:
 * o foco fica no botão e a opção ativa é anunciada via aria-activedescendant.
 * No desktop a lista abre como dropdown; abaixo de 620px o CSS a transforma
 * numa folha inferior com fundo escurecido, no lugar do seletor do sistema.
 */
export function Select({ id, value, groups, onChange, title, closeLabel, icon, compact }: SelectProps) {
  const listId = useId();
  const [open, setOpen] = useState(false);
  const flat = groups.flatMap((group) => group.options);
  const selectedIndex = Math.max(0, flat.findIndex((option) => option.value === value));
  const [active, setActive] = useState(selectedIndex);
  const rootRef = useRef<HTMLDivElement>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);
  const listRef = useRef<HTMLDivElement>(null);
  const typeahead = useRef({ text: "", timer: 0 });
  const selected = flat[selectedIndex];

  useEffect(() => {
    if (!open) return;
    const handlePointer = (event: PointerEvent) => {
      if (rootRef.current && !rootRef.current.contains(event.target as Node)) setOpen(false);
    };
    document.addEventListener("pointerdown", handlePointer);
    return () => document.removeEventListener("pointerdown", handlePointer);
  }, [open]);

  useEffect(() => {
    if (!open) return;
    listRef.current?.querySelector(`[data-index="${active}"]`)?.scrollIntoView({ block: "nearest" });
  }, [open, active]);

  const openList = () => {
    setActive(selectedIndex);
    setOpen(true);
  };

  const close = () => {
    setOpen(false);
    buttonRef.current?.focus();
  };

  const choose = (index: number) => {
    const option = flat[index];
    if (option) onChange(option.value);
    close();
  };

  // Digitar letras pula para a primeira opção que começa com o texto acumulado,
  // como no <select> nativo; o buffer zera após meio segundo sem digitação.
  const jumpTo = (char: string) => {
    const state = typeahead.current;
    window.clearTimeout(state.timer);
    state.text += char.toLowerCase();
    state.timer = window.setTimeout(() => { state.text = ""; }, 500);
    const start = open ? active : selectedIndex;
    const ordered = [...flat.slice(start + 1), ...flat.slice(0, start + 1)];
    const match = ordered.find((option) => option.label.toLowerCase().startsWith(state.text));
    if (!match) return;
    const index = flat.indexOf(match);
    if (open) setActive(index);
    else onChange(match.value);
  };

  const onKeyDown = (event: ReactKeyboardEvent<HTMLButtonElement>) => {
    const last = flat.length - 1;
    if (!open) {
      if (["ArrowDown", "ArrowUp", "Enter", " "].includes(event.key)) {
        event.preventDefault();
        openList();
      } else if (event.key.length === 1 && !event.ctrlKey && !event.metaKey && !event.altKey) jumpTo(event.key);
      return;
    }
    switch (event.key) {
      case "ArrowDown": event.preventDefault(); setActive((current) => Math.min(last, current + 1)); break;
      case "ArrowUp": event.preventDefault(); setActive((current) => Math.max(0, current - 1)); break;
      case "Home": event.preventDefault(); setActive(0); break;
      case "End": event.preventDefault(); setActive(last); break;
      case "PageDown": event.preventDefault(); setActive((current) => Math.min(last, current + 8)); break;
      case "PageUp": event.preventDefault(); setActive((current) => Math.max(0, current - 8)); break;
      case "Enter":
      case " ": event.preventDefault(); choose(active); break;
      case "Escape": event.preventDefault(); close(); break;
      case "Tab": setOpen(false); break;
      default:
        if (event.key.length === 1 && !event.ctrlKey && !event.metaKey && !event.altKey) jumpTo(event.key);
    }
  };

  let index = -1;
  return (
    <div className={`select ${compact ? "compact" : ""} ${open ? "open" : ""}`} ref={rootRef}>
      <button
        id={id}
        ref={buttonRef}
        type="button"
        className="select-trigger"
        role="combobox"
        aria-haspopup="listbox"
        aria-expanded={open}
        aria-controls={listId}
        aria-activedescendant={open ? `${listId}-${active}` : undefined}
        onClick={() => (open ? close() : openList())}
        onKeyDown={onKeyDown}
      >
        {icon}
        <span className="select-value">{selected?.label}</span>
        <ChevronDown size={compact ? 16 : 17} className={open ? "rotated" : ""} />
      </button>
      {open && (
        <>
          <div className="select-backdrop" onClick={close} aria-hidden="true" />
          <div className="select-popover">
            <div className="select-sheet-head">
              <span>{title}</span>
              <button type="button" onClick={close} aria-label={closeLabel}><X size={18} /></button>
            </div>
            <div className="combo-list select-list" id={listId} role="listbox" aria-labelledby={id} ref={listRef}>
              {groups.map((group, groupIndex) => (
                <div className="combo-group" role={group.label ? "group" : undefined} aria-label={group.label} key={group.label ?? `group-${groupIndex}`}>
                  {group.label && <span className="combo-group-label" aria-hidden="true">{group.label}</span>}
                  {group.options.map((option) => {
                    index += 1;
                    const optionIndex = index;
                    const isSelected = option.value === value;
                    return (
                      <div
                        key={option.value}
                        id={`${listId}-${optionIndex}`}
                        data-index={optionIndex}
                        role="option"
                        aria-selected={isSelected}
                        className={`combo-option ${optionIndex === active ? "active" : ""} ${isSelected ? "selected" : ""}`}
                        onMouseEnter={() => setActive(optionIndex)}
                        onMouseDown={(event) => event.preventDefault()}
                        onClick={() => choose(optionIndex)}
                      >
                        <span>{option.label}</span>
                        {option.meta && <b>{option.meta}</b>}
                        {isSelected && <Check size={14} />}
                      </div>
                    );
                  })}
                </div>
              ))}
            </div>
          </div>
        </>
      )}
    </div>
  );
}

/**
 * Dica acionada por hover, foco ou toque — o atributo `title` nativo não
 * aparece em telas de toque e não segue a identidade visual.
 */
export function HintTip({ label, children }: { label: string; children: ReactNode }) {
  const tipId = useId();
  const [open, setOpen] = useState(false);
  const rootRef = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    if (!open) return;
    const handlePointer = (event: PointerEvent) => {
      if (rootRef.current && !rootRef.current.contains(event.target as Node)) setOpen(false);
    };
    const handleKey = (event: KeyboardEvent) => { if (event.key === "Escape") setOpen(false); };
    document.addEventListener("pointerdown", handlePointer);
    document.addEventListener("keydown", handleKey);
    return () => {
      document.removeEventListener("pointerdown", handlePointer);
      document.removeEventListener("keydown", handleKey);
    };
  }, [open]);

  return (
    <span className="hint-tip" ref={rootRef} onMouseEnter={() => setOpen(true)} onMouseLeave={() => setOpen(false)}>
      <button
        type="button"
        className="hint"
        aria-label={label}
        aria-describedby={open ? tipId : undefined}
        // Em toque o navegador emula mouseenter antes do click; alternar aqui
        // fecharia a dica no mesmo gesto. Fecha-se tocando fora ou com Esc.
        onClick={() => setOpen(true)}
        onFocus={() => setOpen(true)}
        onBlur={() => setOpen(false)}
      >
        {children}
      </button>
      {open && <span className="hint-bubble" id={tipId} role="tooltip">{label}</span>}
    </span>
  );
}
