import React, { useState } from 'react';

export function DropdownMenu({ children }) {
  return <div className="relative">{children}</div>;
}

export function DropdownMenuTrigger({ children, asChild }) {
  return React.cloneElement(children, { className: `${children.props.className} cursor-pointer` });
}

export function DropdownMenuContent({ children, align = "left" }) {
  const [isOpen, setIsOpen] = useState(false);
  const alignClass = align === "end" ? "right-0" : "left-0";
  
  return (
    <div className={`absolute ${alignClass} mt-2 w-56 rounded-md shadow-lg bg-white ring-1 ring-black ring-opacity-5 ${isOpen ? '' : 'hidden'}`}>
      <div className="py-1" role="menu" aria-orientation="vertical" aria-labelledby="options-menu">
        {children}
      </div>
    </div>
  );
}

export function DropdownMenuItem({ children }) {
  return (
    <a href="#" className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 hover:text-gray-900" role="menuitem">
      {children}
    </a>
  );
}