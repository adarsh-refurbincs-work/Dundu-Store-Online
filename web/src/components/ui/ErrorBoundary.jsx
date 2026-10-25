import { Component } from 'react';

// Catches render-time crashes inside a route so the page shows a recoverable
// message instead of going blank. Logs the error with the route for debugging.
export default class ErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { error: null };
  }

  static getDerivedStateFromError(error) {
    return { error };
  }

  componentDidCatch(error, info) {
    // eslint-disable-next-line no-console
    console.error(`[route-error] ${window.location.pathname}`, error, info?.componentStack);
  }

  componentDidUpdate(prevProps) {
    // Navigating to another route clears the error so the new page can render.
    if (this.state.error && prevProps.resetKey !== this.props.resetKey) this.setState({ error: null });
  }

  render() {
    if (!this.state.error) return this.props.children;
    return (
      <div className="container-x py-16 text-center space-y-4">
        <p className="font-display text-2xl text-ink">Something went wrong on this page</p>
        <p className="text-sm text-muted">{String(this.state.error?.message || this.state.error)}</p>
        <div className="flex justify-center gap-3">
          <button type="button" onClick={() => window.location.reload()}
            className="h-11 px-5 rounded-full bg-primary text-white font-semibold hover:bg-primary-deep transition-colors">Reload</button>
          <a href="/products" className="h-11 px-5 rounded-full border border-line text-ink font-semibold flex items-center hover:border-primary transition-colors">Browse products</a>
        </div>
      </div>
    );
  }
}
