import { Component, type ErrorInfo, type ReactNode } from 'react';
import { AlertTriangle } from 'lucide-react';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
  title?: string;
}

interface State {
  hasError: boolean;
}

export class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false
  };

  public static getDerivedStateFromError(_: Error): State {
    return { hasError: true };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error("ErrorBoundary caught an error:", error, errorInfo);
  }

  private handleReset = () => {
    this.setState({ hasError: false });
  };

  public render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }
      return (
        <div className="bg-red-500/5 border border-red-500/10 rounded-2xl p-5 text-center flex flex-col items-center gap-3 w-full shadow-lg backdrop-blur-md">
          <div className="p-2 bg-red-500/10 text-red-500 rounded-xl border border-red-500/20">
            <AlertTriangle size={18} />
          </div>
          <h3 className="text-xs font-bold text-white uppercase tracking-wider">
            {this.props.title || "Section Failed to Load"}
          </h3>
          <p className="text-[10px] text-zinc-400 max-w-[240px] leading-relaxed">
            There was a temporary problem loading this component. Please try again.
          </p>
          <button 
            onClick={this.handleReset}
            className="px-4 py-2 bg-red-500/10 hover:bg-red-500/20 text-red-400 text-[10px] font-black rounded-lg border border-red-500/20 transition-all uppercase tracking-wider cursor-pointer"
          >
            Retry
          </button>
        </div>
      );
    }

    return this.props.children;
  }
}
