/**
 * ErrorBoundary - معالج الأخطاء الشامل
 * 
 * يلتقط الأخطاء في شجرة المكونات ويعرض UI بديل
 */

import { Component } from 'react';
import { AlertCircle, RefreshCw, Home } from 'lucide-react';

class ErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
      errorInfo: null
    };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true };
  }

  componentDidCatch(error, errorInfo) {
    // تسجيل الخطأ (يمكن إرساله لـ Sentry أو خدمة أخرى)
    // console.error('ErrorBoundary caught an error:', error, errorInfo);
    
    this.setState({
      error,
      errorInfo
    });

    // يمكن إرسال الخطأ لخدمة تتبع الأخطاء
    if (this.props.onError) {
      this.props.onError(error, errorInfo);
    }
  }

  handleReset = () => {
    this.setState({
      hasError: false,
      error: null,
      errorInfo: null
    });
    
    if (this.props.onReset) {
      this.props.onReset();
    }
  };

  handleGoHome = () => {
    window.location.href = '/';
  };

  render() {
    if (this.state.hasError) {
      // UI بديل عند حدوث خطأ
      return (
        <div className="min-h-screen bg-shadow-bg flex items-center justify-center p-6">
          <div className="max-w-2xl w-full">
            <div className="cyber-card bg-shadow-surface rounded-lg border border-red-500/30 p-8 space-y-6">
              {/* الأيقونة */}
              <div className="flex justify-center">
                <div className="w-20 h-20 rounded-full bg-red-500/10 flex items-center justify-center">
                  <AlertCircle className="w-12 h-12 text-red-500" />
                </div>
              </div>

              {/* العنوان */}
              <div className="text-center space-y-2">
                <h1 className="text-3xl font-bold text-shadow-text">
                  عذراً، حدث خطأ غير متوقع
                </h1>
                <p className="text-shadow-text/60">
                  نعتذر عن الإزعاج. تم تسجيل المشكلة وسنعمل على حلها.
                </p>
              </div>

              {/* تفاصيل الخطأ (في وضع التطوير فقط) */}
              {import.meta.env.DEV && this.state.error && (
                <div className="bg-shadow-bg rounded-lg p-4 space-y-2">
                  <h3 className="text-sm font-semibold text-red-400">
                    تفاصيل الخطأ (Development Mode):
                  </h3>
                  <pre className="text-xs text-shadow-text/80 overflow-auto max-h-40 p-3 bg-black/20 rounded">
                    {this.state.error.toString()}
                    {this.state.errorInfo?.componentStack}
                  </pre>
                </div>
              )}

              {/* الأزرار */}
              <div className="flex gap-4 justify-center">
                <button
                  onClick={this.handleReset}
                  className="cyber-button bg-shadow-accent px-6 py-3 rounded-lg flex items-center gap-2 hover:shadow-glow transition-all"
                >
                  <RefreshCw className="w-5 h-5" />
                  إعادة المحاولة
                </button>
                
                <button
                  onClick={this.handleGoHome}
                  className="px-6 py-3 border-2 border-shadow-primary/20 rounded-lg flex items-center gap-2 hover:border-shadow-accent/50 text-shadow-text transition-all"
                >
                  <Home className="w-5 h-5" />
                  الصفحة الرئيسية
                </button>
              </div>

              {/* معلومات إضافية */}
              <div className="text-center text-sm text-shadow-text/40">
                <p>إذا استمرت المشكلة، يرجى الاتصال بالدعم الفني</p>
              </div>
            </div>
          </div>

          {/* Cyber Grid Background */}
          <div className="fixed inset-0 pointer-events-none opacity-10 cyber-grid -z-10" />
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
