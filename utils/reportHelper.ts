import type { Reporter, TestCase, TestResult, FullConfig, Suite } from '@playwright/test/reporter';
import chalk from 'chalk';

class TerminalReporter implements Reporter {
  private results: {
    passed: number;
    failed: number;
    skipped: number;
    errors: string[];
    warnings: string[];
  } = { passed: 0, failed: 0, skipped: 0, errors: [], warnings: [] };

  onBegin(config: FullConfig, suite: Suite) {
    console.log(chalk.blueBright(`\n🚀 Starting Playwright tests with ${suite.allTests().length} tests...\n`));
  }

  onTestEnd(test: TestCase, result: TestResult) {
    if (result.status === 'passed') {
      this.results.passed++;
      console.log(chalk.green(`✔ PASS: ${test.title}`));
    } else if (result.status === 'failed') {
      this.results.failed++;
      const errorMsg =
        result.error?.message ||
        (result.errors && result.errors.length > 0 && result.errors[0].message) ||
        'Unknown error';
      this.results.errors.push(`${test.title}\n${errorMsg}`);
      console.log(chalk.red(`✖ FAIL: ${test.title}\n    ${errorMsg}`));
    } else if (result.status === 'skipped') {
      this.results.skipped++;
      console.log(chalk.yellow(`⚠ SKIP: ${test.title}`));
    }

    // Example: custom warning collection (you can trigger this as you wish)
    // if (someWarningCondition) this.results.warnings.push("Some warning message");
  }

  onEnd() {
    console.log(chalk.bold('\n===================='));
    console.log(
      chalk.green(`✔ Passed: ${this.results.passed}`),
      chalk.red(`✖ Failed: ${this.results.failed}`),
      chalk.yellow(`⚠ Skipped: ${this.results.skipped}`)
    );
    if (this.results.errors.length > 0) {
      console.log(chalk.redBright('\n--- Errors ---'));
      this.results.errors.forEach((err, i) => {
        console.log(chalk.redBright(`${i + 1}) ${err}\n`));
      });
    }
    if (this.results.warnings.length > 0) {
      console.log(chalk.yellowBright('\n--- Warnings ---'));
      this.results.warnings.forEach((warn, i) => {
        console.log(chalk.yellowBright(`${i + 1}) ${warn}`));
      });
    }
    console.log(chalk.bold('====================\n'));
  }
}

export default TerminalReporter;