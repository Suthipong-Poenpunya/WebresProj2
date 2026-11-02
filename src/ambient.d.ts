declare namespace React {
  export type ReactNode = any;
  export type FC<P = {}> = (props: P & { children?: ReactNode }) => any;

  export interface RefObject<T> {
    current: T;
  }

  export interface FormEvent<T = Element> {
    preventDefault(): void;
    stopPropagation(): void;
    currentTarget: T & { value?: any };
    target: any;
  }

  export interface ChangeEvent<T = HTMLInputElement | HTMLTextAreaElement> {
    preventDefault(): void;
    target: T & { value: string; checked: boolean };
    currentTarget: T & { value: string; checked: boolean };
  }

  export interface KeyboardEvent<T = Element> {
    key: string;
    code?: string;
    preventDefault(): void;
    stopPropagation(): void;
    currentTarget: T;
  }

  export interface ClipboardEvent<T = Element> {
    clipboardData: {
      getData(format: string): string;
    };
    preventDefault(): void;
    currentTarget: T;
  }

  export interface MouseEvent<T = Element> {
    preventDefault(): void;
    stopPropagation(): void;
    currentTarget: T;
  }

  export function useState<T>(
    initialState: T | (() => T)
  ): [T, (value: T | ((prev: T) => T)) => void];

  export function useEffect(
    effect: () => void | (() => void),
    deps?: readonly any[]
  ): void;

  export function useRef<T>(initialValue: T): RefObject<T>;

  export const StrictMode: FC<{ children?: ReactNode }>;
  export function createElement(type: any, props?: any, ...children: any[]): any;
}

declare module 'react' {
  export = React;
}

declare namespace JSX {
  type Element = any;
  interface IntrinsicElements {
    input: {
      value?: string | number;
      checked?: boolean;
      onChange?: (e: React.ChangeEvent<HTMLInputElement>) => void;
      onKeyDown?: (e: React.KeyboardEvent<HTMLInputElement>) => void;
      onPaste?: (e: React.ClipboardEvent<HTMLInputElement>) => void;
      [key: string]: any;
    };
    textarea: {
      value?: string | number;
      onChange?: (e: React.ChangeEvent<HTMLTextAreaElement>) => void;
      onKeyDown?: (e: React.KeyboardEvent<HTMLTextAreaElement>) => void;
      onPaste?: (e: React.ClipboardEvent<HTMLTextAreaElement>) => void;
      [key: string]: any;
    };
    form: {
      onSubmit?: (e: React.FormEvent<HTMLFormElement>) => void;
      [key: string]: any;
    };
    [elemName: string]: any;
  }
}

declare module 'react/jsx-runtime' {
  export function jsx(type: any, props: any, key?: any): any;
  export function jsxs(type: any, props: any, key?: any): any;
  export const Fragment: any;
}

declare module 'react/jsx-dev-runtime' {
  export function jsxDEV(type: any, props: any, key?: any): any;
  export const Fragment: any;
}

declare module 'react-dom/client' {
  export function createRoot(container: Element | DocumentFragment): {
    render(children: any): void;
    unmount(): void;
  };
  const ReactDOM: {
    createRoot: typeof createRoot;
  };
  export default ReactDOM;
}

declare module 'lucide-react' {
  export interface LucideProps {
    className?: string;
    size?: number | string;
    color?: string;
    strokeWidth?: number | string;
    title?: string;
    [key: string]: any;
  }
  export type LucideIcon = React.FC<LucideProps>;

  export const ShieldCheck: LucideIcon;
  export const AlertTriangle: LucideIcon;
  export const Flame: LucideIcon;
  export const Clock: LucideIcon;
  export const Keyboard: LucideIcon;
  export const ClipboardPaste: LucideIcon;
  export const RotateCcw: LucideIcon;
  export const Sparkles: LucideIcon;
  export const PenTool: LucideIcon;
  export const Mic: LucideIcon;
  export const Square: LucideIcon;
  export const EyeOff: LucideIcon;
  export const CheckCircle2: LucideIcon;
  export const FileText: LucideIcon;
  export const UserCheck: LucideIcon;
  export const Search: LucideIcon;
  export const Lock: LucideIcon;
  export const Send: LucideIcon;
  export const Volume2: LucideIcon;
  export const BookOpen: LucideIcon;
  export const SlidersHorizontal: LucideIcon;
  export const Pin: LucideIcon;
  export const Megaphone: LucideIcon;
  export const Lightbulb: LucideIcon;
  export const MessageSquare: LucideIcon;
  export const ShieldAlert: LucideIcon;
  export const ExternalLink: LucideIcon;
  export const ThumbsUp: LucideIcon;
  export const Heart: LucideIcon;
  export const HelpCircle: LucideIcon;
  export const Plus: LucideIcon;
  export const Trash2: LucideIcon;
  export const Activity: LucideIcon;
  export const Zap: LucideIcon;
  export const ArrowRight: LucideIcon;
  export const MessageCircleQuestion: LucideIcon;
  export const Layers: LucideIcon;
  export const History: LucideIcon;
  export const Users: LucideIcon;
  export const X: LucideIcon;
  export const KeyRound: LucideIcon;
  export const AlertOctagon: LucideIcon;
  export const Radio: LucideIcon;
  export const MessageSquareText: LucideIcon;
  export const FileCheck2: LucideIcon;
  export const LogOut: LucideIcon;
  export const GraduationCap: LucideIcon;
}

declare module 'vite' {
  export function defineConfig(config: Record<string, any>): Record<string, any>;
}

declare module '@vitejs/plugin-react' {
  export default function react(options?: Record<string, any>): any;
}

