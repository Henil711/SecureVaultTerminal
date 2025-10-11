import { ReactNode } from 'react';

interface TerminalButtonProps {
  onClick: () => void;
  children: ReactNode;
  variant?: 'primary' | 'secondary' | 'danger';
  disabled?: boolean;
}

export const TerminalButton = ({
  onClick,
  children,
  variant = 'primary',
  disabled = false
}: TerminalButtonProps) => {
  const variants = {
    primary: 'border-green-500 text-green-500 hover:bg-green-500 hover:text-black',
    secondary: 'border-blue-500 text-blue-500 hover:bg-blue-500 hover:text-black',
    danger: 'border-red-500 text-red-500 hover:bg-red-500 hover:text-black',
  };

  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={`
        px-4 py-2 border font-mono text-sm transition-all
        ${variants[variant]}
        ${disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}
        disabled:hover:bg-transparent disabled:hover:text-inherit
      `}
    >
      [ {children} ]
    </button>
  );
};
