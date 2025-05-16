import { Injectable, Signal, signal, WritableSignal } from '@angular/core';
import { LogService } from '@services/log/log.service';

@Injectable({
  providedIn: 'root'
})
export class WebPService {

  private webPSupported: WritableSignal<boolean> = signal(false);

  private readonly kTestImages: { [key: string]: string } = {
    lossy: "UklGRiIAAABXRUJQVlA4IBYAAAAwAQCdASoBAAEADsD+JaQAA3AAAAAA",
    lossless: "UklGRhoAAABXRUJQVlA4TA0AAAAvAAAAEAcQERGIiP4HAA==",
    alpha: "UklGRkoAAABXRUJQVlA4WAoAAAAQAAAAAAAAAAAAQUxQSAwAAAARBxAR/Q9ERP8DAABWUDggGAAAABQBAJ0BKgEAAQAAAP4AAA3AAP7mtQAAAA==",
    animation: "UklGRlIAAABXRUJQVlA4WAoAAAASAAAAAAAAAAAAQU5JTQYAAAD/////AABBTk1GJgAAAAAAAAAAAAAAAAAAAGQAAABWUDhMDQAAAC8AAAAQBxAREYiI/gcA"
  }

  constructor(private logger: LogService) {

    let supportPromises: Promise<webPSupport>[] = [
      this.checkWebPSupport(WebPFeature.alpha),
      this.checkWebPSupport(WebPFeature.lossless),
    ];

    Promise
      .allSettled(supportPromises)
      .then((results) => {

        let isSupported = true;

        results.forEach((result) => {
          if (result.status === "fulfilled") {

            const value = result.value as webPSupport;

            isSupported = isSupported && value.supported;

            if (value.supported) {
              this.logger.debug(`WebP ${value.feature} is supported`);
            } else {
              this.logger.debug(`WebP ${value.feature} is not supported`);
            }
          } else {
            isSupported = false;
          }
        });

        this.webPSupported.set(isSupported);
      });
  }

  getWebPSupported(): Signal<boolean> {
    return this.webPSupported.asReadonly();
  }

  checkWebPSupport(feature: WebPFeature = WebPFeature.alpha): Promise<webPSupport> {

    return new Promise((resolve, reject) => {

      var img = new Image();

      img.onload = function () {
        var result = (img.width > 0) && (img.height > 0);
        resolve({
          feature: feature,
          supported: result
        } as webPSupport);
      };

      img.onerror = function () {
        resolve({
          feature: feature,
          supported: false
        } as webPSupport);
      };

      img.src = "data:image/webp;base64," + this.kTestImages[feature];
    });
  }
}

interface webPSupport {
  feature: WebPFeature;
  supported: boolean;
}

export enum WebPFeature {
  lossy = "lossy",
  lossless = "lossless",
  alpha = "alpha",
  animation = "animation"
}