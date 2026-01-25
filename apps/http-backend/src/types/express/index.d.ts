
//typescript uses .d.ts declaration files to load type infomration
import * as express from 'express';

declare global {
  namespace Express {
    interface Request {
    //   customProperty?: string; // Add your optional or required properties
      userId? : string
    }
  }
}