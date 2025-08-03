import { toast as hotToast } from "sonner";

interface ToastOptions {
  duration?: number;
  icon?: string;
}

export const toast = {
  success: (message: string, options: ToastOptions = {}) => {
    return hotToast.success(message, {
      duration: options.duration || 3000,
      icon: options.icon || "✅",
    });
  },
  error: (message: string, options: ToastOptions = {}) => {
    return hotToast.error(message, {
      duration: options.duration || 4000,
      icon: options.icon || "❌",
    });
  },
  loading: (message: string, options: ToastOptions = {}) => {
    return hotToast.loading(message, {
      duration: options.duration || 3000,
    });
  },
};
