export enum LogLevel {
  All = 0,
  Debug = 1,
  Info = 2,
  Warn = 3,
  Error = 4,
  Fatal = 5,
  Off = 6
}

export class LogEntry {

  entryDate: Date = new Date();
  message: string = "";
  level: LogLevel = LogLevel.Debug;
  extraInfo: any[] = [];
  logWithDate: boolean = true;

  logToConsole() {

    switch (this.level) {
      case LogLevel.Debug:
        console.debug(this.buildLogStringBase(), ...this.extraInfo);
        break;
      case LogLevel.Info:
        console.info(this.buildLogStringBase(), ...this.extraInfo);
        break;
      case LogLevel.Warn:
        console.warn(this.buildLogStringBase(), ...this.extraInfo);
        break;
      case LogLevel.Error:
        console.error(this.buildLogStringBase(), ...this.extraInfo);
        break;
      case LogLevel.Fatal:
        console.error(this.buildLogStringBase(), ...this.extraInfo);
        break;
      default:
        console.log(this.buildLogStringBase(), ...this.extraInfo);
    }
  }

  buildLogString(): string {

    let entryOutput: string = this.buildLogStringBase();

    if (this.extraInfo.length) {

      entryOutput += " - Extra Info: " + this.formatParams(this.extraInfo);
    }

    return entryOutput;
  }

  private buildLogStringBase(): string {

    let entryOutput: string = `[${LogLevel[this.level]}] `;

    if (this.logWithDate) {

      entryOutput += `${new Date()} - `;
    }

    entryOutput += this.message;

    return entryOutput;
  }

  /**
   * Converts extra data on the log message to a string
   *
   * @param params additional parameters
   * @returns string
   */
  private formatParams(params: any[]): string {

    let paramString: string = params.join(",");

    if (params.some(p => typeof p == "object")) {

      paramString = "";

      for (let item of params) {

        paramString += JSON.stringify(item) + ",";
      }
    }

    return paramString;
  }
}