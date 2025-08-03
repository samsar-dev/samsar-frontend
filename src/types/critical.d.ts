// Type declarations for critical package
declare module 'critical' {
  interface CriticalOptions {
    base?: string;
    src: string;
    dest?: string;
    width?: number;
    height?: number;
    dimensions?: Array<{ width: number; height: number }>;
    extract?: boolean;
    inline?: boolean;
    inlineImages?: boolean;
    timeout?: number;
    ignore?: {
      atrule?: string[];
      rule?: RegExp[];
    };
  }

  interface CriticalResult {
    css: string;
    html: string;
  }

  function generate(options: CriticalOptions): Promise<CriticalResult>;
  
  export = {
    generate
  };
}
