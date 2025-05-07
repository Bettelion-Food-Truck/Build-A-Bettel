import { Injectable } from '@angular/core';

import { LogEntry, LogLevel } from './log-entry.model';

/**
 * Logging system.
 *
 * Heavily based on https://www.codemag.com/article/1711021/Logging-in-Angular-Applications
 */
@Injectable({
  providedIn: 'root'
})
export class LogService {

  level: LogLevel = LogLevel.All;
  logWithDate: boolean = true;

  constructor() {
  }

  debug(msg: string, ...optionalParams: any[]) {

    this.writeToLog(msg, LogLevel.Debug, optionalParams);
  }

  info(msg: string, ...optionalParams: any[]) {

    this.writeToLog(msg, LogLevel.Info, optionalParams);
  }

  warn(msg: string, ...optionalParams: any[]) {

    this.writeToLog(msg, LogLevel.Warn, optionalParams);
  }

  error(msg: string, ...optionalParams: any[]) {

    this.writeToLog(msg, LogLevel.Error, optionalParams);
  }

  fatal(msg: string, ...optionalParams: any[]) {

    this.writeToLog(msg, LogLevel.Fatal, optionalParams);
  }

  log(msg: string, ...optionalParams: any[]) {

    this.writeToLog(msg, LogLevel.All, optionalParams);
  }

  private writeToLog(msg: string, level: LogLevel, params: any[]) {

    if (this.shouldLog(level)) {

      let entry: LogEntry = new LogEntry();
      entry.message = msg;
      entry.level = level;
      entry.extraInfo = params;
      entry.logWithDate = this.logWithDate;

      // Output log message -- maybe change this in the future but works for now
      console.log(entry.buildLogString());
    }
  }

  private shouldLog(level: LogLevel): boolean {

    return (
      (level >= this.level && level !== LogLevel.Off) ||
      this.level === LogLevel.All
    );
  }
}
