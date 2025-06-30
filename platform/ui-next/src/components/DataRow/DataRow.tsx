import React, { useEffect, useState } from 'react';
import { Icons } from '../../components/Icons/Icons';
import { Tooltip, TooltipTrigger, TooltipContent } from '../../components/Tooltip/Tooltip';

/**
 * DataRow is a complex UI component that displays a selectable, interactive row with hierarchical data.
 * It's designed to show a numbered item with a title, optional color indicator, and expandable details.
 * The row supports various interactive features like visibility toggling, locking, and contextual actions.
 *
 * @component
 * @example
 * ```tsx
 * <DataRow
 *   number={1}
 *   title="My Item"
 *   details={{
 *     primary: ["Main detail", "  Sub detail"],
 *     secondary: []
 *   }}
 *   isVisible={true}
 *   isLocked={false}
 *   onToggleVisibility={() => {}}
 *   onToggleLocked={() => {}}
 *   onRename={() => {}}
 *   onDelete={() => {}}
 *   onColor={() => {}}
 * />
 * ```
 */

/**
 * Props for the DataRow component
 * @interface DataRowProps
 * @property {number} number - The display number/index of the row
 * @property {string} title - The main text label for the row
 * @property {boolean} disableEditing - When true, prevents rename and delete operations
 * @property {string} [colorHex] - Optional hex color code to display a color indicator
 * @property {Object} [details] - Optional hierarchical details to display below the row
 * @property {string[]} details.primary - Primary details shown immediately below the row
 * @property {string[]} details.secondary - Secondary details (currently unused)
 * @property {boolean} [isSelected] - Whether the row is currently selected
 * @property {() => void} [onSelect] - Callback when the row is clicked/selected
 * @property {boolean} isVisible - Controls the row's visibility state
 * @property {() => void} onToggleVisibility - Callback to toggle visibility
 * @property {boolean} isLocked - Controls the row's locked state
 * @property {() => void} onToggleLocked - Callback to toggle locked state
 * @property {() => void} onRename - Callback when rename is requested
 * @property {() => void} onDelete - Callback when delete is requested
 * @property {() => void} onColor - Callback when color change is requested
 */
interface DataRowProps {
  number: number;
  disableEditing: boolean;
  description: string;
  details?: { primary: string[]; secondary: string[] };
  //
  isSelected?: boolean;
  onSelect?: () => void;
  //
  isVisible: boolean;
  onToggleVisibility: () => void;
  //
  isLocked: boolean;
  onToggleLocked: () => void;
  //
  title: string;
  onRename: () => void;
  //
  onDelete: () => void;
  //
  colorHex?: string;
  onColor: () => void;
}

const DataRow: React.FC<DataRowProps> = ({
  number,
  title,
  colorHex,
  details,
  onSelect,
  isLocked,
  onToggleVisibility,
  onToggleLocked,
  onRename,
  onDelete,
  onColor,
  isSelected = false,
  isVisible = true,
  disableEditing = false,
}) => {
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [readOnly, setReadOnly] = useState(false);
  useEffect(() => {
    if (JSON.parse(localStorage.getItem('readOnly'))) {
      setReadOnly(JSON.parse(localStorage.getItem('readOnly'))?.readOnly);
    } else {
      console.log('we are in false....c');
    }
  }, []);

  const handleAction = (action: string, e: React.MouseEvent) => {
    e.stopPropagation();
    switch (action) {
      case 'Rename':
        onRename();
        break;
      case 'Lock':
        onToggleLocked();
        break;
      case 'Delete':
        onDelete();
        break;
      case 'Color':
        onColor();
        break;
    }
  };

  const decodeHTML = (html: string) => {
    const txt = document.createElement('textarea');
    txt.innerHTML = html;
    return txt.value;
  };

  const renderDetailText = (text: string, indent: number = 0) => {
    const indentation = '  '.repeat(indent);
    if (text === '') {
      return (
        <div
          key={`empty-${indent}`}
          className="h-2"
        ></div>
      );
    }
    const cleanText = decodeHTML(text);
    return (
      <div
        key={cleanText}
        className="whitespace-pre-wrap"
      >
        {indentation}
        {cleanText.includes(':') ? (
          <>
            <span className="font-medium">{cleanText.split(':')[0]}:</span>
            {cleanText.split(':')[1]}
          </>
        ) : (
          <span className="font-medium">{cleanText}</span>
        )}
      </div>
    );
  };

  const renderDetails = (details: string[]) => {
    const visibleLines = details.slice(0, 4);
    const hiddenLines = details.slice(4);

    return (
      <Tooltip>
        <TooltipTrigger asChild>
          <div className="cursor-help">
            <div className="flex flex-col space-y-1">
              {visibleLines.map((line, lineIndex) =>
                renderDetailText(line, line.startsWith('  ') ? 1 : 0)
              )}
            </div>
            {hiddenLines.length > 0 && (
              <div className="text-muted-foreground mt-1 flex items-center text-sm">
                <span>...</span>
                <Icons.Info className="mr-1 h-5 w-5" />
              </div>
            )}
          </div>
        </TooltipTrigger>
        <TooltipContent
          side="right"
          align="start"
          className="max-w-md"
        >
          <div className="text-secondary-foreground flex flex-col space-y-1 text-sm leading-normal">
            {details.map((line, lineIndex) =>
              renderDetailText(line, line.startsWith('  ') ? 1 : 0)
            )}
          </div>
        </TooltipContent>
      </Tooltip>
    );
  };

  return (
    <div
      className={`flex items-stretch ${isSelected ? 'bg-white' : 'bg-white'} group relative cursor-pointer`}
      onClick={onSelect}
      data-cy="data-row"
    >
      {/* Hover Overlay */}
      <div className="bg-primary/20 pointer-events-none absolute inset-0 opacity-0 transition-opacity group-hover:opacity-100"></div>

      {/* Number Box */}
      <div
        className={`bg-highlight flex w-7 flex-shrink-0 items-center justify-center overflow-hidden rounded-l border-r border-white text-base text-black`}
      >
        {number}
      </div>

      {/* Content */}
      <div className="flex flex-col gap-2">
        {/* Label with Conditional Tooltip */}
        <div className="ml-2 flex-1 overflow-hidden">
          <span
            className={`text-base ${
              isSelected ? 'text-highlight' : 'text-muted-foreground'
            } [overflow:hidden] [display:-webkit-box] [-webkit-box-orient:vertical]`}
          >
            {title}
          </span>
        </div>
        {!readOnly && (
          <div className="ml-2 flex justify-start gap-2">
            <div onClick={e => handleAction('Rename', e)}>
              <Icons.Rename className="text-black" />
            </div>
            <div onClick={e => handleAction('Delete', e)}>
              <Icons.Cancel className="text-foreground" />
            </div>
            {onColor && (
              <div onClick={e => handleAction('Color', e)}>
                <Icons.ColorChange className="text-foreground" />
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default DataRow;
