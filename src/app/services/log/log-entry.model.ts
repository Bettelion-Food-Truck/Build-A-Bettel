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

  /**
   * Converts entry to string
   * 
   * @returns string
   */
  buildLogString(): string {

    let entryOutput: string = "";

    if (this.logWithDate) {

      entryOutput = new Date() + " - ";
    }

    entryOutput += "Type: " + LogLevel[this.level];
    entryOutput += " - Message: " + this.message;

    if (this.extraInfo.length) {

      entryOutput += " - Extra Info: " + this.formatParams(this.extraInfo);
    }

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