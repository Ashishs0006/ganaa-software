/**
 * SystemMonitor.ts
 * ------------------------------------------
 * A utility class to monitor Node.js process health,
 * including memory and CPU usage, uptime, platform info, etc.
 *
 * Developed by: GadgetVala
 * @author Suraj Verma (gadgetvala)
 * ------------------------------------------
 */
export default class SystemMonitor {
  private intervalId?: NodeJS.Timeout; // Stores the reference to setInterval
  private readonly intervalMs: number; // Interval duration in milliseconds

  /**
   * @param intervalMs Interval in milliseconds to log system stats (default is 5000ms)
   */
  constructor(intervalMs: number = 5000) {
    this.intervalMs = intervalMs;
  }

  /**
   * Starts the system monitoring loop
   */
  public start() {
    if (this.intervalId) {
      console.warn('SystemMonitor is already running.');
      return;
    }

    console.log('🔍 SystemMonitor started.');

    this.intervalId = setInterval(() => {
      this.logStats();
    }, this.intervalMs);
  }

  /**
   * Stops the monitoring interval
   */
  public stop() {
    if (this.intervalId) {
      clearInterval(this.intervalId);
      this.intervalId = undefined;
      console.log('🛑 SystemMonitor stopped.');
    }
  }

  /**
   * Collects and logs process statistics to the console
   */
  private logStats() {
    const memory = process.memoryUsage(); // Get memory stats
    const cpu = process.cpuUsage(); // Get CPU stats
    const uptime = process.uptime(); // Get process uptime

    console.log('--- System Monitor Snapshot ---');
    console.log(`🆔 Process ID: ${process.pid}`);
    console.log(`🟢 Node.js Version: ${process.version}`);
    console.log(`🕐 Uptime: ${uptime.toFixed(2)} seconds`);

    // Memory usage in MB
    console.log(`💾 Memory Usage:`);
    console.log(`   - RSS: ${(memory.rss / 1024 / 1024).toFixed(2)} MB`);
    console.log(`   - Heap Total: ${(memory.heapTotal / 1024 / 1024).toFixed(2)} MB`);
    console.log(`   - Heap Used: ${(memory.heapUsed / 1024 / 1024).toFixed(2)} MB`);
    console.log(`   - External: ${(memory.external / 1024 / 1024).toFixed(2)} MB`);
    console.log(`   - Array Buffers: ${(memory.arrayBuffers / 1024 / 1024).toFixed(2)} MB`);

    // CPU usage since process start (in microseconds)
    console.log(`⚙️ CPU Usage:`);
    console.log(`   - User: ${(cpu.user / 1000).toFixed(2)} ms`);
    console.log(`   - System: ${(cpu.system / 1000).toFixed(2)} ms`);

    // Platform and architecture
    console.log(`🌐 Platform: ${process.platform}`);
    console.log(`🏗️ Architecture: ${process.arch}`);
    console.log('-------------------------------\n');
  }

  /**
   * Call this method to print a one-time snapshot outside of the interval
   */
  public snapshotNow() {
    this.logStats();
  }
}
