import type { Reporter, TestCase, TestResult, FullConfig, Suite } from '@playwright/test/reporter';
import chalk from 'chalk';

class TerminalReporter implements Reporter {
  private results: {
    passed: number;
    failed: number;
    errors: { title: string; message: string }[];
  } = { passed: 0, failed: 0, errors: [] };

  onBegin(config: FullConfig, suite: Suite) {
    console.log(chalk.blueBright(`\n🚀 Starting Playwright tests with ${suite.allTests().length} tests...\n`));
  }

  onTestEnd(test: TestCase, result: TestResult) {
    // Treat anything not "passed" or "skipped" as failed (includes timeouts, interrupted, broken, etc.)
    if (result.status === 'passed') {
      this.results.passed++;
      console.log(chalk.green(`✔ PASS: ${test.title}`));
    } else if (result.status === 'skipped') {
      // Skipped tests are ignored in output and summary
    } else {
      this.results.failed++;
      const errorMsg =
        result.error?.message ||
        (result.errors && result.errors.length > 0 && result.errors[0].message) ||
        (result.status === 'timedOut' ? 'Test timed out.' : 'Unknown error');
      this.results.errors.push({ title: test.title, message: errorMsg });
      // Print only the first line of the error in the summary, full error below
      const firstLine = errorMsg.split('\n')[0];
      console.log(chalk.red(`✖ FAIL: ${test.title}\n    ${firstLine}`));
    }
  }

  onEnd() {
    const total = this.results.passed + this.results.failed;
    console.log(chalk.bold('\n===================='));
    console.log(
      chalk.green(`✔ Passed: ${this.results.passed}`),
      chalk.red(`✖ Failed: ${this.results.failed}`),
      chalk.cyan(`Total executed: ${total}`)
    );
    if (this.results.errors.length > 0) {
      console.log(chalk.redBright('\n--- Errors ---'));
      this.results.errors.forEach((err, i) => {
        console.log(
          chalk.redBright(`${i + 1}) ${err.title}\n${err.message}\n`)
        );
      });
    }
    console.log(chalk.bold('====================\n'));
  }
}

export default TerminalReporter;